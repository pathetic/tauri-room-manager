#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::prelude::*;
use lazy_static::lazy_static;
use once_cell::sync::Lazy;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Arc;
use surrealdb_rs::net::WsClient;
use surrealdb_rs::param::Root;
use surrealdb_rs::protocol::Ws;
use surrealdb_rs::StaticClient;
use surrealdb_rs::Surreal;
use tokio::sync::Mutex;

mod state;
use state::State;

mod booking;
use booking::{Booking, IDBooking};

mod utils;
use utils::{generate_random_str, pw_to_bytes, start_surreal_db};

lazy_static! {
    static ref DB_PASSWORD: String = generate_random_str(8);
}

static SAVE_PATH: Lazy<Arc<Mutex<PathBuf>>> = Lazy::new(|| Arc::new(Mutex::new(PathBuf::new())));
static DB: Surreal<WsClient> = Surreal::new();
static STATE: Lazy<Arc<Mutex<State>>> = Lazy::new(|| Arc::new(Mutex::new(State::default())));

#[tauri::command(async)]
async fn read_save(password: String) {
    let mut state = STATE.lock().await;
    (*state).password = pw_to_bytes(&password);
    state
        .read_data_file(
            std::path::Path::new(&SAVE_PATH.lock().await.to_path_buf()),
            &DB,
        )
        .await
        .expect("Couldn't read data file");
}

#[tauri::command(async)]
async fn does_db_exist() -> bool {
    does_file_exist(&SAVE_PATH.lock().await.to_path_buf())
}

#[tauri::command(async)]
fn does_file_exist(path: &PathBuf) -> bool {
    std::path::Path::exists(std::path::Path::new(&path))
}

#[tauri::command(async)]
async fn get_all_bookings() -> Vec<IDBooking> {
    let state = STATE.lock().await;
    let notes: Vec<_> = state
        .get_all_bookings(&DB)
        .await
        .expect("Couldn't get all bookings");
    notes
}

#[tauri::command(async)]
async fn add_booking(booking: Booking) -> IDBooking {
    let mut state = STATE.lock().await;
    state
        .add_booking(&DB, booking)
        .await
        .expect("Couldn't add booking")
}

#[tauri::command(async)]
async fn delete_booking(id: String) -> bool {
    let mut state = STATE.lock().await;

    match state.delete_booking(&DB, id).await {
        core::result::Result::Ok(_) => true, // Deletion was successful
        Err(_) => false,                     // Deletion failed
    }
}

#[tauri::command(async)]
async fn search_between(start: String, end: String) -> Vec<IDBooking> {
    let state = STATE.lock().await;
    let bookings = state
        .search_between(&DB, start, end)
        .await
        .expect("Couldn't get bookings");
    bookings
}

#[tauri::command(async)]
async fn update_booking(
    id: String,
    title: String,
    description: String,
    resource_id: String,
    start: String,
    end: String,
    status: String,
) -> bool {
    let mut state = STATE.lock().await;

    match state
        .update_booking(&DB, id, title, description, resource_id, start, end, status)
        .await
    {
        core::result::Result::Ok(_) => true, // Deletion was successful
        Err(_) => false,                     // Deletion failed
    }
}

#[tauri::command(async)]
async fn create_state(password: String) {
    *STATE.lock().await = State::new(pw_to_bytes(&password));
    STATE
        .lock()
        .await
        .add_booking(
            &DB,
            Booking {
                title: "Reservation example".to_string(),
                description: "Description example...".to_string(),
                resource_id: "101".to_string(),
                start: Utc::now().format("%Y-%m-%d").to_string(),
                end: Utc::now().format("%Y-%m-%d").to_string(),
                status: "Reserved".to_string(),
            },
        )
        .await
        .expect("Cannot add example booking");
}

#[tauri::command(async)]
async fn save_state() {
    STATE
        .lock()
        .await
        .save_data_file(
            std::path::Path::new(&SAVE_PATH.lock().await.to_path_buf()),
            &DB,
        )
        .await
        .expect("Couldn't save state");
}

#[tokio::main]
async fn main() {
    // find process called surreal and kill it
    let mut surreal_process = Command::new("taskkill");
    surreal_process.arg("/F").arg("/IM").arg("surreal.exe");
    let mut surreal_process = surreal_process.spawn().unwrap();
    surreal_process.wait().unwrap();

    start_surreal_db(&DB_PASSWORD).unwrap();

    DB.connect::<Ws>("localhost:1312").await.unwrap();

    DB.signin(Root {
        username: "roomadmin",
        password: &DB_PASSWORD,
    })
    .await
    .unwrap();

    DB.use_ns("namespace").use_db("database").await.unwrap();

    tauri::async_runtime::set(tokio::runtime::Handle::current());
    let foo = tauri::Builder::default().invoke_handler(tauri::generate_handler![
        does_db_exist,
        create_state,
        read_save,
        save_state,
        get_all_bookings,
        add_booking,
        delete_booking,
        update_booking,
        search_between
    ]);

    let context = tauri::generate_context!();
    let app = foo.build(context).unwrap();

    let path = app.path_resolver().app_data_dir().unwrap();
    std::fs::create_dir_all(&path).expect("Cannot create db dir");
    let path = Path::join(
        app.path_resolver().app_data_dir().unwrap().as_path(),
        "database",
    );
    println!("The database is/will be located at {}", &path.display());

    *SAVE_PATH.lock().await = path;

    app.run(|_, _| {})
}

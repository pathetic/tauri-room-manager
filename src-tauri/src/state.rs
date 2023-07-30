use serde::{Deserialize, Serialize};
use tokio::fs::File;
use tokio::io::AsyncReadExt;

use crate::booking::{Booking, IDBooking};
use crate::utils::{decrypt_bytes, encrypt_bytes, generate_nonce};

use surrealdb_rs::net::WsClient;
use surrealdb_rs::Surreal;

use anyhow::{Error, Ok};

use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct State {
    pub nonce: [u8; 24],
    pub password: [u8; 32],
    pub booking_id: String,
}

impl State {
    pub fn default() -> Self {
        State {
            nonce: [0u8; 24],
            password: [0u8; 32],
            booking_id: String::new(),
        }
    }

    pub fn new(password: [u8; 32]) -> Self {
        State {
            nonce: generate_nonce(),
            password,
            booking_id: String::new(),
        }
    }

    pub async fn read_data_file(
        &mut self,
        path: &Path,
        db: &Surreal<WsClient>,
    ) -> Result<(), anyhow::Error> {
        let mut file = File::open(path).await?;
        let mut nonce = [0u8; 24];
        let mut buff: Vec<u8> = Vec::new();
        file.read_to_end(&mut buff).await?;
        for i in 0..24 {
            nonce[i] = buff[i]
        }
        let decrypted = decrypt_bytes(&buff, &self.password)?;
        drop(buff);

        let decrypted = String::from_utf8(decrypted).unwrap();

        let bookings: Vec<Booking> = serde_json::from_str(&decrypted).unwrap();

        for booking in bookings {
            self.add_booking(db, booking).await?;
        }
        drop(decrypted);
        self.nonce = nonce;
        Ok(())
    }

    pub async fn save_data_file(
        &self,
        path: &Path,
        db: &Surreal<WsClient>,
    ) -> Result<(), anyhow::Error> {
        let encoded = serde_json::to_string(&self.get_all_bookings(db).await?).expect("foo");
        let encoded = encoded.as_bytes();
        let encrypted = encrypt_bytes(&encoded, &self.password, &self.nonce)?;
        drop(encoded);
        std::fs::write(path, encrypted)?;
        Ok(())
    }

    pub async fn add_booking(
        &mut self,
        db: &Surreal<WsClient>,
        booking: Booking,
    ) -> Result<IDBooking, Error> {
        let result: IDBooking = db.create("booking").content(booking).await?;
        Ok(result)
    }

    pub async fn update_booking(
        &mut self,
        db: &Surreal<WsClient>,
        id: String,
        title: String,
        description: String,
        resource_id: String,
        start: String,
        end: String,
        status: String,
    ) -> Result<(), Error> {
        db.query(
            format!("UPDATE {} SET title = '{}', description = '{}', resource_id = '{}', start = '{}', end = '{}', status = '{}'", id, title, description, resource_id, start, end, status)
        ).await?;
        Ok(())
    }

    pub async fn delete_booking(
        &mut self,
        db: &Surreal<WsClient>,
        id: String,
    ) -> Result<(), Error> {
        db.query(format!("DELETE {};", id)).await?;
        Ok(())
    }

    pub async fn get_all_bookings(&self, db: &Surreal<WsClient>) -> Result<Vec<IDBooking>, Error> {
        let resp = db.query("SELECT * FROM booking;").await?;
        Ok(resp.get(0, ..)?)
    }

    pub async fn search_between(
        &self,
        db: &Surreal<WsClient>,
        start: String,
        end: String,
    ) -> Result<Vec<IDBooking>, Error> {
        let resp = db
            .query(format!(
                "SELECT * FROM booking WHERE start <= '{}' AND end > '{}';",
                end, start
            ))
            .await?;
        Ok(resp.get(0, ..)?)
    }
}

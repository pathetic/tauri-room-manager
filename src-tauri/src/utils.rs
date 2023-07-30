use anyhow::{anyhow, Ok};
use chacha20poly1305::aead::rand_core::RngCore;
use chacha20poly1305::{aead::Aead, KeyInit, XChaCha20Poly1305};
use rand::rngs::OsRng;
use rand::{distributions::Alphanumeric, Rng};

use sha2::{Digest, Sha256};

use std::os::windows::process::CommandExt;
use std::process::{Child, Command};

pub fn encrypt_bytes(
    data: &[u8],
    key: &[u8; 32],
    nonce: &[u8; 24],
) -> Result<Vec<u8>, anyhow::Error> {
    let cipher = XChaCha20Poly1305::new(key.into());

    let mut encrypted = cipher
        .encrypt(nonce.into(), data)
        .map_err(|err| anyhow!("Encrypting bytes: {}", err))?;
    let mut v = Vec::from(nonce.as_slice());
    v.append(&mut encrypted);
    Ok(v)
}

pub fn decrypt_bytes(data: &[u8], key: &[u8; 32]) -> Result<Vec<u8>, anyhow::Error> {
    let cipher = XChaCha20Poly1305::new(key.into());

    let dec = cipher
        .decrypt(data[0..24].into(), data[24..].as_ref())
        .map_err(|err| anyhow!("Decrypting bytes: {}", err))?;
    Ok(dec)
}

pub fn generate_nonce() -> [u8; 24] {
    let mut nonce = [0u8; 24];
    OsRng.fill_bytes(&mut nonce);
    nonce
}

pub fn pw_to_bytes(password: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    let result = hasher.finalize();
    result.try_into().unwrap()
}

pub fn generate_random_str(length: usize) -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}

const DETACHED_PROCESS: u32 = 0x00000008;

pub fn start_surreal_db(password: &str) -> Result<Child, anyhow::Error> {
    Ok(Command::new(format!("surreal"))
        .args([
            "start",
            "--user",
            "roomadmin",
            "--pass",
            password,
            "--bind",
            "0.0.0.0:1312",
            "memory",
        ])
        .creation_flags(DETACHED_PROCESS)
        .spawn()?)
}

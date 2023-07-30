use serde::{Deserialize, Serialize};
use serde_with::serde_as;

#[derive(Debug, Serialize, Deserialize)]
pub struct IDBooking {
    pub id: String,
    pub title: String,
    pub description: String,
    pub resource_id: String,
    pub start: String,
    pub end: String,
    pub status: String,
}

#[serde_as]
#[derive(Debug, Serialize, Deserialize)]
pub struct Booking {
    pub title: String,
    pub description: String,
    pub resource_id: String,
    pub start: String,
    pub end: String,
    pub status: String,
}

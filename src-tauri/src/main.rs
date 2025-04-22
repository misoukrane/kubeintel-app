// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use fix_path_env::fix;

fn main() {
    if let Err(e) = fix() {
        println!("{}", e);
    } else {
        println!("PATH: {}", std::env::var("PATH").unwrap());
    }
    kubeintel_lib::run()
}

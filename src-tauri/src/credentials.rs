use keyring::Entry;

const SERVICE_NAME: &str = "io.kubeintel";

#[tauri::command]
pub async fn set_secret(key: String, value: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, &key).map_err(|e| e.to_string())?;
    entry.set_password(&value).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_secret(key: String) -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, &key).map_err(|e| e.to_string())?;
    let value = entry.get_password().map_err(|e| e.to_string())?;
    Ok(value)
}

#[tauri::command]
pub async fn remove_secret(key: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, &key).map_err(|e| e.to_string())?;
    entry.delete_credential().map_err(|e| e.to_string())?;
    Ok(())
}


#[tauri::command]
fn read_kubeconfig(filepath: &str) -> Result<String, String> {
    std::fs::read_to_string(filepath).map_err(|e| e.to_string())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_kubeconfig])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

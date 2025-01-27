use kube::config::Kubeconfig;
use std::path::Path;

#[tauri::command]
pub fn read_kubeconfig(kubeconfig_path: &str) -> Result<Kubeconfig, String> {
    let kubeconfig =
        Kubeconfig::read_from(Path::new(kubeconfig_path)).map_err(|e| e.to_string())?;
    Ok(kubeconfig)
}

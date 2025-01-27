use kube::{config::Kubeconfig, Client, Config};
use std::path::Path;

#[tauri::command]
pub fn read_kubeconfig(kubeconfig_path: &str) -> Result<Kubeconfig, String> {
    let kubeconfig =
        Kubeconfig::read_from(Path::new(kubeconfig_path)).map_err(|e| e.to_string())?;
    Ok(kubeconfig)
}

#[tauri::command]
pub async fn cluster_version(kubeconfig_path: String) -> Result<String, String> {
    // Load the kubeconfig file
    let kubeconfig: Kubeconfig =
        Kubeconfig::read_from(Path::new(&kubeconfig_path)).map_err(|e| e.to_string())?;

    // Create a client using the config
    let config = Config::from_custom_kubeconfig(kubeconfig, &Default::default())
        .await
        .map_err(|e| e.to_string())?;
    let client = Client::try_from(config).map_err(|e| e.to_string())?;

    // Get cluster information
    let version = client
        .apiserver_version()
        .await
        .map_err(|e| e.to_string())?;

    Ok(format!("{:?}", version))
}

use crate::k8s_client;
use k8s_openapi::api::core::v1::Pod;
use kube::Api;

// list all pods in a namespace
#[tauri::command]
pub async fn all_pods(
    kubeconfig_path: String,
    context: String,
    namespace: String,
) -> Result<Vec<Pod>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;

    // Get all pods in the namespace
    let pods = Api::<Pod>::namespaced(client, &namespace);
    let pods_list = pods
        .list(&Default::default())
        .await
        .map_err(|e| e.to_string())?;
    Ok(pods_list.items)
}

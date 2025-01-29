use crate::k8s_client;
use k8s_openapi::api::core::v1::Namespace;
use kube::Api;

// list all pods in a namespace
#[tauri::command]
pub async fn all_namespaces(
    kubeconfig_path: String,
    context: String,
) -> Result<Vec<Namespace>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;

    // Get all namespaces
    let namespaces = Api::<Namespace>::all(client);
    let namespaces_list = namespaces
        .list(&Default::default())
        .await
        .map_err(|e| e.to_string())?;
    Ok(namespaces_list.items)
}

use crate::k8s_client;
use k8s_openapi::api::core::v1::Pod;
use kube::api::ListParams;
use kube::Api;

#[tauri::command]
pub async fn list_pods_on_node(
    kubeconfig_path: String,
    context: String,
    node_name: String,
) -> Result<Vec<Pod>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    let pods: Api<Pod> = Api::all(client);
    let lp = ListParams::default().fields(&format!("spec.nodeName={}", node_name));
    let pod_list = pods.list(&lp).await.map_err(|e| e.to_string())?;
    Ok(pod_list.items)
}

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

// debug a node by name
#[tauri::command]
pub async fn debug_node(
    kubeconfig_path: String,
    context: String,
    node_name: String,
    image: String,
) -> Result<(), String> {
    let cmd_string = format!(
        "--kubeconfig {} --context {} debug node/{} -it --image {}",
        kubeconfig_path, context, node_name, image,
    );
    crate::kubectl::run_kubectl_command(&cmd_string)?;
    Ok(())
}

// cordon a node by name
#[tauri::command]
pub async fn cordon_node(
    kubeconfig_path: String,
    context: String,
    node_name: String,
) -> Result<(), String> {
    let cmd_string = format!(
        "--kubeconfig {} --context {} cordon {}",
        kubeconfig_path, context, node_name,
    );
    crate::kubectl::run_kubectl_command(&cmd_string)?;
    Ok(())
}

// drain a node by name
#[tauri::command]
pub async fn drain_node(
    kubeconfig_path: String,
    context: String,
    node_name: String,
) -> Result<(), String> {
    let cmd_string = format!(
        "--kubeconfig {} --context {} drain {} --ignore-daemonsets",
        kubeconfig_path, context, node_name,
    );
    crate::kubectl::run_kubectl_command(&cmd_string)?;
    Ok(())
}

// uncordon a node by name
#[tauri::command]
pub async fn uncordon_node(
    kubeconfig_path: String,
    context: String,
    node_name: String,
) -> Result<(), String> {
    let cmd_string = format!(
        "--kubeconfig {} --context {} uncordon {}",
        kubeconfig_path, context, node_name,
    );
    crate::kubectl::run_kubectl_command(&cmd_string)?;
    Ok(())
}

#!/usr/bin/env bash

# Stop script on any error
set -euo pipefail

### --- Configuration --- ###

# REQUIRED: Set the target namespace the service account will have admin access to
TARGET_NAMESPACE="my-limited-namespace" # <<< CHANGE THIS

# REQUIRED: Set the desired name for the Service Account (will also be used as the 'user' in kubeconfig)
SERVICE_ACCOUNT_NAME="limited-user-sa" # <<< CHANGE THIS (use a descriptive name)

# REQUIRED: Name for the generated kubeconfig file
KUBECONFIG_OUTPUT_FILE="${SERVICE_ACCOUNT_NAME}-kubeconfig.yaml"

# --- Cluster Role to Grant ---
# 'admin' gives full control within the namespace.
# Other options: 'edit' (modify most objects, not roles/bindings), 'view' (read-only)
ROLE_TO_GRANT="admin"

### --- Script Logic --- ###

echo "--- Starting Kubeconfig Generation for Service Account: ${SERVICE_ACCOUNT_NAME} in Namespace: ${TARGET_NAMESPACE} ---"

# --- 1. Create Namespace (if needed) ---
echo "[INFO] Ensuring namespace '${TARGET_NAMESPACE}' exists..."
kubectl create namespace "${TARGET_NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f - || echo "[WARN] Namespace '${TARGET_NAMESPACE}' already exists or could not be created (might be okay)."

# --- 2. Create Service Account ---
echo "[INFO] Creating Service Account '${SERVICE_ACCOUNT_NAME}' in namespace '${TARGET_NAMESPACE}'..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${SERVICE_ACCOUNT_NAME}
  namespace: ${TARGET_NAMESPACE}
EOF

# --- 3. Create RoleBinding ---
ROLEBINDING_NAME="${SERVICE_ACCOUNT_NAME}-${ROLE_TO_GRANT}-binding"
echo "[INFO] Creating RoleBinding '${ROLEBINDING_NAME}' to grant '${ROLE_TO_GRANT}' role..."
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ${ROLEBINDING_NAME}
  namespace: ${TARGET_NAMESPACE}
subjects:
- kind: ServiceAccount
  name: ${SERVICE_ACCOUNT_NAME} # Name of the Service Account
  namespace: ${TARGET_NAMESPACE} # Namespace of the Service Account
roleRef:
  kind: ClusterRole             # Use ClusterRole ('admin', 'edit', 'view')
  name: ${ROLE_TO_GRANT}        # The role to grant
  apiGroup: rbac.authorization.k8s.io
EOF
echo "[INFO] RoleBinding created."

# --- 4. Get Service Account Token ---
# For K8s v1.24+, tokens are not auto-generated in secrets anymore.
# We need to explicitly create a Secret of type 'kubernetes.io/service-account-token'
# OR use the 'kubectl create token' command (preferred).

echo "[INFO] Generating token for Service Account '${SERVICE_ACCOUNT_NAME}'..."

# Use 'kubectl create token' (requires Kubernetes v1.24+)
# Set a reasonable expiration time if needed, e.g., --duration=8760h for 1 year
# Default is usually 1 hour - might be too short for a user kubeconfig. Let's try requesting a long-lived one (support depends on cluster config).
# If --duration isn't supported or fails, remove it for a shorter-lived token.
SERVICE_ACCOUNT_TOKEN=$(kubectl create token ${SERVICE_ACCOUNT_NAME} --namespace ${TARGET_NAMESPACE} --duration=8760h 2>/dev/null || kubectl create token ${SERVICE_ACCOUNT_NAME} --namespace ${TARGET_NAMESPACE})

if [ -z "${SERVICE_ACCOUNT_TOKEN}" ]; then
    echo "[ERROR] Could not generate token for Service Account '${SERVICE_ACCOUNT_NAME}'. Check permissions or cluster version compatibility."
    # Attempt legacy secret method as fallback (might not work on newer clusters or be disabled)
    echo "[INFO] Attempting legacy Secret method as fallback..."
    LEGACY_SECRET_NAME="${SERVICE_ACCOUNT_NAME}-token-legacy"
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: ${LEGACY_SECRET_NAME}
  namespace: ${TARGET_NAMESPACE}
  annotations:
    kubernetes.io/service-account.name: ${SERVICE_ACCOUNT_NAME}
type: kubernetes.io/service-account-token
EOF
    echo "[INFO] Waiting briefly for token controller to populate legacy secret..."
    sleep 5
    SERVICE_ACCOUNT_TOKEN=$(kubectl get secret ${LEGACY_SECRET_NAME} --namespace ${TARGET_NAMESPACE} -o jsonpath='{.data.token}' 2>/dev/null | base64 -d)
    kubectl delete secret ${LEGACY_SECRET_NAME} --namespace ${TARGET_NAMESPACE} --ignore-not-found=true # Clean up temp secret
     if [ -z "${SERVICE_ACCOUNT_TOKEN}" ]; then
        echo "[ERROR] Legacy secret method also failed. Cannot proceed."
        exit 1
     fi
     echo "[WARN] Used legacy token secret method. This token might not automatically rotate."
fi

echo "[INFO] Token generated successfully."


# --- 5. Get Cluster Details from Current Context ---
echo "[INFO] Fetching cluster details from current kubeconfig context..."
CURRENT_CONTEXT=$(kubectl config current-context)
CURRENT_CLUSTER=$(kubectl config view -o jsonpath="{.contexts[?(@.name==\"${CURRENT_CONTEXT}\")].context.cluster}")
CLUSTER_API_SERVER=$(kubectl config view -o jsonpath="{.clusters[?(@.name==\"${CURRENT_CLUSTER}\")].cluster.server}")
CLUSTER_CA_DATA_BASE64=$(kubectl config view --raw -o jsonpath="{.clusters[?(@.name==\"${CURRENT_CLUSTER}\")].cluster.certificate-authority-data}")

if [ -z "${CURRENT_CLUSTER}" ] || [ -z "${CLUSTER_API_SERVER}" ] || [ -z "${CLUSTER_CA_DATA_BASE64}" ]; then
    echo "[ERROR] Could not extract cluster details from current kubeconfig. Make sure your admin kubeconfig is active."
    exit 1
fi
echo "[INFO] Cluster details obtained for cluster '${CURRENT_CLUSTER}'."

# --- 6. Create Kubeconfig File ---
echo "[INFO] Assembling kubeconfig file -> ${KUBECONFIG_OUTPUT_FILE}"

# Backup existing file if it exists
if [ -f "${KUBECONFIG_OUTPUT_FILE}" ]; then
    cp "${KUBECONFIG_OUTPUT_FILE}" "${KUBECONFIG_OUTPUT_FILE}.bak-$(date +%s)"
    echo "[WARN] Backed up existing file to ${KUBECONFIG_OUTPUT_FILE}.bak-..."
fi

# Use temporary KUBECONFIG to build the file cleanly
export KUBECONFIG="${KUBECONFIG_OUTPUT_FILE}"

# Set cluster details
kubectl config set-cluster "${CURRENT_CLUSTER}" \
  --server="${CLUSTER_API_SERVER}" \
  --certificate-authority=<(echo "${CLUSTER_CA_DATA_BASE64}" | base64 -d) \
  --embed-certs=true

# Set user credentials (using the Service Account token)
# The 'user' name in kubeconfig can be the SA name for clarity
kubectl config set-credentials "${SERVICE_ACCOUNT_NAME}" \
  --token="${SERVICE_ACCOUNT_TOKEN}"

# Set context
CONTEXT_NAME="${SERVICE_ACCOUNT_NAME}-${TARGET_NAMESPACE}"
kubectl config set-context "${CONTEXT_NAME}" \
  --cluster="${CURRENT_CLUSTER}" \
  --user="${SERVICE_ACCOUNT_NAME}" \
  --namespace="${TARGET_NAMESPACE}"

# Use the new context
kubectl config use-context "${CONTEXT_NAME}"

# Unset the temporary KUBECONFIG env var
unset KUBECONFIG

# --- 7. Completion ---
echo ""
echo "--- Kubeconfig Generation Complete! ---"
echo ""
echo "Kubeconfig file created: ${KUBECONFIG_OUTPUT_FILE}"
echo "Service Account: ${SERVICE_ACCOUNT_NAME}"
echo "Namespace Access: ${TARGET_NAMESPACE} ('${ROLE_TO_GRANT}' role)"
echo ""
echo "[IMPORTANT NOTES]"
echo "*   The 'user' in this kubeconfig is the Service Account '${SERVICE_ACCOUNT_NAME}'."
echo "*   Authentication uses a Service Account Token."
echo "*   Access is revoked by deleting the Service Account ('kubectl delete sa ${SERVICE_ACCOUNT_NAME} -n ${TARGET_NAMESPACE}') or the RoleBinding."
echo "*   The token generated might have an expiration ('kubectl create token' default is often 1 hour, though we requested longer). If access stops working, the token may need regeneration (re-run relevant parts of the script or just the 'kubectl create token' command)."
echo ""
echo "[NEXT STEPS]"
echo "1. Securely distribute the '${KUBECONFIG_OUTPUT_FILE}' file to the user."
echo "2. The user can use it via:"
echo "   - Placing it at ~/.kube/config (backup first!)"
echo "   - Setting the KUBECONFIG environment variable: export KUBECONFIG=\"${PWD}/${KUBECONFIG_OUTPUT_FILE}\""
echo "   - Using the --kubeconfig flag: kubectl --kubeconfig \"${KUBECONFIG_OUTPUT_FILE}\" get pods"
echo "3. Test the user's access:"
echo "   kubectl --kubeconfig=\"${KUBECONFIG_OUTPUT_FILE}\" get pods -n \"${TARGET_NAMESPACE}\"  # Should work"
echo "   kubectl --kubeconfig=\"${KUBECONFIG_OUTPUT_FILE}\" get pods -n default          # Should be forbidden"
echo "   kubectl --kubeconfig=\"${KUBECONFIG_OUTPUT_FILE}\" get nodes                # Should be forbidden"
echo ""
echo "--- Done ---"
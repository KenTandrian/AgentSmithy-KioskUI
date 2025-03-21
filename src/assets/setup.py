import os
import re
import subprocess

# TODO: Install  pip install google-cloud-discoveryengine==0.13.7
from google.cloud import discoveryengine
from uuid import uuid4

PROJECT_ID = "agentsmithy-sample-3"
REGION = "us-central1"
AGENT_NAME = "Ivan"

# User selection config
AGENT_FOUNDATION_MODEL = "gemini-2.0-flash"
AGENT_INDUSTRY_TYPE = "finance"
AGENT_ORCHESTRATION_FRAMEWORK = "llamaindex_agent"

# GitHub Constants.
REPOSITORY_NAME = "AgentSmithy"
# TODO: Set branch to release
REPOSITORY_BRANCH = "feature/deployment"
REPOSITORY_URL = "git@github.com:srastatter/AgentSmithy.git"

# Terraform Constants.
TERRAFORM_DIRECTORY = "deployment/terraform"
TERRAFORM_VAR_FILE = "vars/env.tfvars"

# GCP resources constants.
ARTIFACT_REGISTRY_REPOSITORY = f"{PROJECT_ID.lower().replace(' ', '-')}-{AGENT_NAME.lower().replace(' ', '-')}-repository"

CLOUD_RUN_BACKEND_SERVICE_NAME = AGENT_NAME.lower().replace(" ", "-") + "-backend"
CLOUD_RUN_FRONTEND_SERVICE_NAME = AGENT_NAME.lower().replace(" ", "-") + "-frontend"

DATASTORE_INDUSTRY_SOURCES_MAP = {
    'finance': 'gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs/*.pdf',
    'healthcare': 'gs://cloud-samples-data/vertex-ai/medlm/primock57/transcripts/*.txt',
    'retail': 'gs://cloud-samples-data/dialogflow-cx/google-store/*.html',
}
# TODO: Uncomment this when creating a datastore from the script.
# DATA_STORE_ID = 'agent_smithy_data_store_{}'.format(uuid4())
DATA_STORE_ID = 'agent_smithy_data_store_45aed69c-e30f-4ba9-b334-74a9b7fd2b7b'
DATA_STORE_LOCATION = 'global'
DATA_STORE_NAME = f"{PROJECT_ID.lower().replace(' ', '-')}-{AGENT_NAME.lower().replace(' ', '-')}-datastore"

GCS_STAGING_BUCKET = f"gs://{PROJECT_ID.lower().replace(' ', '-')}-{AGENT_NAME.lower().replace(' ', '-')}-vertexai-staging"

# Cloud Run services config.
BACKEND_PATH = "Agent_Templates/Runtime_env"
BACKEND_CONFIG_FILE = f"{os.path.dirname(os.path.abspath(__file__))}/{REPOSITORY_NAME}/{BACKEND_PATH}/app/config.yaml"
FRONTEND_PATH = "Agent_Templates/ChatbotUI"
FRONTEND_CONFIG_FILE = f"{os.path.dirname(os.path.abspath(__file__))}/{REPOSITORY_NAME}/{FRONTEND_PATH}/src/environments/environment.ts"

def clone(repo_url: str, branch: str):
  remove_command = ["rm", "-rf", REPOSITORY_NAME]
  subprocess.run(remove_command, check=True)

  clone_command = ["git", "clone", "-b", branch, repo_url]
  subprocess.run(clone_command, check=True)

def deploy_terraform_infrastructure(directory: str, variables_file: str):
    init_terraform_command = ["terraform", "init"]
    apply_terraform_command = ["terraform", "apply", "--var-file", variables_file]

    navigate_to_directory(directory)
    
    search_and_replace_file(f"{os.path.dirname(os.path.abspath(__file__))}/{REPOSITORY_NAME}/{directory}/{variables_file}", r"project_id=\"(.*?)\"", f'project_id="{PROJECT_ID}"')
    search_and_replace_file(f"{os.path.dirname(os.path.abspath(__file__))}/{REPOSITORY_NAME}/{directory}/{variables_file}", r"region=\"(.*?)\"", f'region="{REGION}"')
    search_and_replace_file(f"{os.path.dirname(os.path.abspath(__file__))}/{REPOSITORY_NAME}/{directory}/{variables_file}", r"agent_name=\"(.*?)\"", f'agent_name="{AGENT_NAME}"')

    subprocess.run(init_terraform_command, check=True)
    subprocess.run(apply_terraform_command, check=True)

def create_data_store() -> str:
    client = discoveryengine.DataStoreServiceClient()
    parent = client.collection_path(
        project=PROJECT_ID,
        location=DATA_STORE_LOCATION,
        collection="default_collection",
    )
    data_store = discoveryengine.DataStore(
        display_name=DATA_STORE_NAME,
        industry_vertical=discoveryengine.IndustryVertical.GENERIC,
        solution_types=[discoveryengine.SolutionType.SOLUTION_TYPE_SEARCH],
        content_config=discoveryengine.DataStore.ContentConfig.CONTENT_REQUIRED,
    )
    request = discoveryengine.CreateDataStoreRequest(
        parent=parent,
        data_store_id=DATA_STORE_ID,
        data_store=data_store,
    )
    operation = client.create_data_store(request=request)
    print(f"Waiting for operation to complete: {operation.operation.name}")
    operation.result()
    return

def populate_data_store(industry: str):    
    client = discoveryengine.DocumentServiceClient()
    parent = client.branch_path(
        project=PROJECT_ID,
        location=DATA_STORE_LOCATION,
        data_store=DATA_STORE_ID,
        branch="default_branch",
    )
    request = discoveryengine.ImportDocumentsRequest(
        parent=parent,
        gcs_source=discoveryengine.GcsSource(
            input_uris=[DATASTORE_INDUSTRY_SOURCES_MAP[industry]],
            data_schema="content",
        ),
        reconciliation_mode=discoveryengine.ImportDocumentsRequest.ReconciliationMode.INCREMENTAL,
    )
    operation = client.import_documents(request=request)
    print(f"Import operation will keep on running on the background: {operation.operation.name}")

def get_cloud_run_url(region: str, service_name: str) -> str:
    try:
        describe = subprocess.run(["gcloud", "run", "services", "describe", service_name, "--region", region], capture_output=True, text=True)
        if describe.returncode == 0:
            url_match = re.search(r"\s+URL:\s+(.*?)\n", describe.stdout)

            if url_match:
                url = url_match.group(1)
                return url
            else:
                print("URL not found in the output.")
                return ""

        else:
            print("Cloud run service does not exist.")
            print(f"Error describing service (non-zero exit code):")
            print(f"Stdout: {describe.stdout}")
            print(f"Stderr: {describe.stderr}")
            return ""
    except Exception as e:  # Catch any other potential errors
        print(f"An unexpected error occurred: {e}")
        return ""

def configure_backend(
        config_file: str,
        project_id: str,
        region: str,
        agent_name: str,
        gcs_bucket: str,
        datastore_id: str,
        frontend_url: str,
        agent_foundation_model: str,
        agent_industry_type: str,
        agent_orchestration_framework: str,
    ):
    search_and_replace_file(config_file, r"PROJECT_ID: \"(.*?)\"", f'PROJECT_ID: "{project_id}"')
    search_and_replace_file(config_file, r"REGION: \"(.*?)\"", f'REGION: "{region}"')
    search_and_replace_file(config_file, r"AGENT_NAME: \"(.*?)\"", f'AGENT_NAME: "{agent_name}"')
    search_and_replace_file(config_file, r"USER_AGENT: \"(.*?)\"", f'USER_AGENT: "{agent_name}"')
    search_and_replace_file(config_file, r"GCS_STAGING_BUCKET: \"(.*?)\"", f'GCS_STAGING_BUCKET: "{gcs_bucket}"')
    search_and_replace_file(config_file, r"DATA_STORE_ID: \"(.*?)\"", f'DATA_STORE_ID: "{datastore_id}"')
    search_and_replace_file(config_file, r"FRONTEND_URL: \"(.*?)\"", f'FRONTEND_URL: "{frontend_url}"')
    search_and_replace_file(config_file, r"AGENT_FOUNDATION_MODEL: \"(.*?)\"", f'AGENT_FOUNDATION_MODEL: "{agent_foundation_model}"')
    search_and_replace_file(config_file, r"AGENT_INDUSTRY_TYPE: \"(.*?)\"", f'AGENT_INDUSTRY_TYPE: "{agent_industry_type}"')
    search_and_replace_file(config_file, r"AGENT_ORCHESTRATION_FRAMEWORK: \"(.*?)\"", f'AGENT_ORCHESTRATION_FRAMEWORK: "{agent_orchestration_framework}"')


def configure_frontend(agent_name: str, backend_url: str, config_file: str):
    search_and_replace_file(config_file, r"backendURL: \"(.*?)\"", f'backendURL: "{backend_url}/"')
    search_and_replace_file(config_file, r"chatbotName: \"(.*?)\"", f'chatbotName: "{agent_name}"')

def build_directory(frontend_directory: str, image_path: str) -> str:
    navigate_to_directory(frontend_directory)
    push_command = ["gcloud", "builds", "submit", "--tag", image_path]
    subprocess.run(push_command, check=True)
    
    return image_path

def deploy_cloud_run(image: str, region: str, service_name: str):
    deploy_command = [
        "gcloud",
        "run",
        "deploy",
        service_name,
        "--image",
        image,
        "--platform",
        "managed",
        "--region",
        region,
        "--memory",
        "2Gi",
        "--min-instances",
        "1",
        "--allow-unauthenticated",
    ]
    subprocess.run(deploy_command, check=True)

def navigate_to_directory(directory: str):
    os.chdir(os.path.dirname(os.path.abspath(__file__)) + f"/{REPOSITORY_NAME}/{directory}")

def search_and_replace_file(file_path: str, search_pattern: str, new_line: str):
    try:
        with open(file_path, "r") as f:
            file_content = f.read()
            updated_content = re.sub(search_pattern, new_line, file_content)
        with open(file_path, "w") as f:
            f.write(updated_content)
    except FileNotFoundError:
        print(f"`{file_path}` file not found.")

if __name__ == "__main__":
    # TODO: Set arguments for calling the script
    #if len(sys.argv) < 2:
    #    print("Usage: python3 local_deploy.py action (e.g action = (clone, run, redeploy))")
    #    exit(1)
    
    # clone(REPOSITORY_URL, REPOSITORY_BRANCH)
    # deploy_terraform_infrastructure(TERRAFORM_DIRECTORY, TERRAFORM_VAR_FILE)

    # create_data_store()
    # populate_data_store(AGENT_INDUSTRY_TYPE)

    # Build and deploy BE Service.
    frontend_url = get_cloud_run_url(REGION, CLOUD_RUN_FRONTEND_SERVICE_NAME)
    image_name = f"{REGION}-docker.pkg.dev/{PROJECT_ID}/{ARTIFACT_REGISTRY_REPOSITORY}/backend:latest"

    configure_backend(
        BACKEND_CONFIG_FILE,
        PROJECT_ID,
        REGION,
        AGENT_NAME,
        GCS_STAGING_BUCKET,
        DATA_STORE_ID,
        frontend_url,
        AGENT_FOUNDATION_MODEL,
        AGENT_INDUSTRY_TYPE,
        AGENT_ORCHESTRATION_FRAMEWORK,
    )
    build_directory(BACKEND_PATH, image_name)
    deploy_cloud_run(image_name, REGION, CLOUD_RUN_BACKEND_SERVICE_NAME)

    # Build and deploy FE Service.
    backend_url = get_cloud_run_url(REGION, CLOUD_RUN_BACKEND_SERVICE_NAME)
    image_name = f"{REGION}-docker.pkg.dev/{PROJECT_ID}/{ARTIFACT_REGISTRY_REPOSITORY}/frontend:latest"

    configure_frontend(AGENT_NAME, backend_url, FRONTEND_CONFIG_FILE)
    build_directory(FRONTEND_PATH, image_name)
    deploy_cloud_run(image_name, REGION, CLOUD_RUN_FRONTEND_SERVICE_NAME)

import { AfterViewInit, Component, ElementRef, inject, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HowItWorksDialogComponent } from '../how-it-works-dialog/how-it-works-dialog.component';
import { CodeDialogComponent } from '../code-dialog/code-dialog.component';
import { MatStepper } from '@angular/material/stepper';
import { AgentConfigurationService } from '../../services/agent-configuration.service';
import { AgentConfiguration, Framework, Industry, Model, Runtime } from '../../models/agent';

@Component({
  selector: 'app-configure-bot',
  templateUrl: './configure-bot.component.html',
  styleUrl: './configure-bot.component.scss'
})
export class ConfigureBotComponent implements OnInit, AfterViewInit {
  agentConfigurationService: AgentConfigurationService = inject(AgentConfigurationService);
  formGroup: FormGroup;
  selectedRuntime: Runtime = 'AgentEngine';
  selectedFramework: Framework = 'langchain_agent';
  selectedIndustry: Industry = 'finance';
  selectedModel: Model = 'gemini-1.5-pro';
  @ViewChild('viewCode', { static: true })
  viewCode: TemplateRef<{}>;
  viewCodeDialogRef?: MatDialogRef<{}>;
  @ViewChild('stepper') stepper: MatStepper;
  howItWorksDescription: string;
  howItWorks: string;
  step: string;

  constructor(private _formBuilder: FormBuilder, private router: Router, private fb: FormBuilder,private themeService: ThemeService,private readonly dialog: MatDialog,private el: ElementRef, private renderer: Renderer2) {
  }

  get formArray(): AbstractControl | null { return this.formGroup.get('formArray'); }

  ngAfterViewInit() {
    setTimeout(() => {
      this.onStepChange(this.stepper.selectedIndex);
    });
  }

  onStepChange(event: any) {
    const currentStepIndex = event;
    this.callMethodBasedOnStep(currentStepIndex);
    if(event === 4){
      let formArray = this.formGroup.get('formArray') as FormArray;
      formArray.at(event).patchValue({  // Use stepIndex to target correct form group
        runTime: this.selectedRuntime,       // Update with selected value
        framework: this.selectedFramework,
        industry: this.selectedIndustry,
        model: ''
      });
      formArray.at(event).markAsDirty();
      formArray = this.formGroup.get('formArray') as FormArray;
      const stepFormGroup = formArray.at(event - 3) as FormGroup;
      if(stepFormGroup.value.runTime === 'AgentEngine'){
        this.stepperConfig[event].options!.forEach(opt => {
          opt.isSelected = false;
          if(opt.label.startsWith("Claude")){
            opt.isDisabled = true;
          }
        });
      } else {
        this.stepperConfig[event].options!.forEach(opt => {
          opt.isSelected = false;
          if(opt.label.startsWith("Claude")){
            if(opt.isDisabled){
              opt.isDisabled = false;
            }
          }
        });
      }
    }
  }

  callMethodBasedOnStep(stepIndex: number) {
    if (stepIndex === 0) {
      this.handleStepZero();
    } else if (stepIndex === 1) {
      this.handleStepOne();
    } else if (stepIndex === 2) {
      this.handleStepTwo();
    } else if (stepIndex === 3) {
      this.handleStepThree();
    } else if (stepIndex === 4) {
      this.handleStepFour();
    } 
  }

  handleStepZero() {
    this.howItWorks = './assets/images/agent_properties_diagram.png';
    this.howItWorksDescription = "This demo will walk you through selecting and building each core element of an AI Agent. Here you are setting the Agent Name, Description, and Industry. These properties are used to populate the Instructions for the Agent Reasoning Loop. Your selection of Industry will also correspond to the different datasets and Tools you have available to you later on in this demo experience.";
    this.step = "agent_properties"
  }

  handleStepOne() {
    this.howItWorks = './assets/images/runtime_diagram.png';
    this.howItWorksDescription = "Here you are setting the Runtime Environment. There are two primary options available to you: Cloud Run / Fast API and Vertex AI Agent Engine. Agent Engine is a fully managed runtime offering which simplifies the process of deploying agents. The Cloud Run / Fast API option is more bespoke and will allow you to get under the hood and customize the server configurations, API setup, request and response structure, etc.";
  }

  handleStepTwo() {
    this.howItWorks = './assets/images/orchestration_diagram.png';
    this.howItWorksDescription = "Here you are setting the Orchestration Framework. AI Agent Orchestration Frameworks have control loops that intelligently route user queries or tasks to the most appropriate agents or tools based on their capabilities and context. They also maintain awareness of the current context and history of interactions, ensuring that agents have the necessary information to perform their tasks effectively.";
  }

  handleStepThree() {
    this.howItWorks = './assets/images/tools_diagram.png';
    this.howItWorksDescription = "Agent Tools are functions or interfaces that allow an AI agent to interact with and perform actions in the external world, such as accessing data, running code, or calling external APIs.\nHow they work:\n\n • Agents use a language model as a reasoning engine to determine which tools to use and in what sequence. \n • Tools provide the agent with the necessary information and functionality to perform specific tasks. \n • Agents can use tools in a loop, deciding how many times to use them.";
  }

  handleStepFour() {
    this.howItWorks = './assets/images/models_diagram.png';
    this.howItWorksDescription = "AI agents leverage foundation models, to process information, reason, and interact with their environment, enabling them to perform tasks autonomously. How they work:\n\n • Reasoning and Planning: Foundation models can help AI agents reason about complex situations, plan actions, and make decisions based on their understanding of the environment. \n • Action Execution: AI agents can use foundation models to generate instructions or commands that control their actions. \n • Tool Calling: AI agents can leverage tool calling capabilities to access external tools and APIs to perform tasks that the foundation model alone cannot handle, such as accessing databases, performing calculations, or making web requests.";
  }

  stepperConfig = [
    {
      heading: 'Agent Properties',
      stepHeading: 'Properties',
      contentType: 'form',
      fields: [
        { label: 'Agent Name', type: 'input', controlName: 'agentName', placeholder: '', required: true },
        { label: 'Description', type: 'text', controlName: 'description', placeholder: '', required: true },
      ],
      caption:'Welcome to the Agent Bar! To begin, please provide a unique name for your agent, something that reflects its purpose or personality. Then, craft a concise description outlining the agent\'s intended function and how it will assist users. This selection will help tailor the agent\'s capabilities and access relevant data, ensuring it\'s optimally configured for its intended environment.',
      howItWorks: '',
      hasNext: true,
      hasPrevious: false,
      hasHome: true,
      hasCode: false,
      hasBack: true
    },
    {
      heading: 'Runtime',
      stepHeading: 'Runtime',
      contentType: 'options',
      subheading: 'An AI runtime provides the necessary environment to deploy and run machine learning models.',
      options: [
        { 
          label: 'Vertex AI Agent Engine', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectRunTime('AgentEngine'),
          subtitle: 'Quickly build, deploy, and run production-ready AI agents on Google Cloud with Vertex AI Agent Engine. This fully managed service handles infrastructure, scaling, and security so you can focus on your agent\'s logic. \n\nPros: Enjoy simplified development, automatic scaling, built-in monitoring and evaluation, and reduced operational overhead. \n\nCons: Highly customized or very simple agents might find the platform\'s comprehensive features more than needed compared to basic self-hosting.',
          caption: './assets/images/vertex_agent.png'
        },
        { 
          label: 'Cloud Run', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectRunTime('CloudRun/FastApi'),
          subtitle: 'Use Cloud Run to host your AI agents as scalable, cost-effective web services. It automatically adjusts resources to match demand and you only pay for what you use, making it efficient for fluctuating workloads. \n\nPros: Highly scalable and cost-efficient (pay-per-use), seamless integration with other Google Cloud services (like Vertex AI), full flexibility to use any language or framework via containers, and simplified deployment.\n\nCons: Requires containerizing your agent, giving you more control but also more responsibility for the application packaging and environment compared to a fully managed platform.',
          caption: 'steps:\n\t- name: \'gcr.io/cloud-builders/docker\'\n\t  args:\n\t\t  - \'build\'\n\t\t  - \'-t\'\n\t\t  - \'us-central1-docker.pkg.dev/agentsmithy-dev/agent-smithy-repository/agent_runtime${_SUFFIX}:latest\'\n\t\t  - \'.\'\n\t- name: \'gcr.io/cloud-builders/docker\'\n\t  args:\n\t\t  - \'push\'\n\t\t  - \'us-central1-docker.pkg.dev/agentsmithy-dev/agent-smithy-repository/agent_runtime${_SUFFIX}:latest\'\n\t- name: \'gcr.io/cloud-builders/gcloud\'\n\t  entrypoint: gcloud\n\t  args:\n\t\t  - \'run\'\n\t\t  - \'deploy\'\n\t\t  - \'agent-runtime${_SUFFIX}\'\n\t\t  - \'--image\'\n\t\t  - \'us-central1-docker.pkg.dev/agentsmithy-dev/agent-smithy-repository/agent_runtime${_SUFFIX}:latest\'\n\t\t - \'--platform\'\n\t\t  - \'managed\'\n\t\t  - \'--region\'\n\t\t  - \'us-central1\'\n\t\t  - \'--memory\'\n\t\t  - \'1Gi\'\n\t\t  - \'--env-vars-file\'\n\t\t  - \'deployment/config/dev.yaml\'\noptions:\n\tsubstitution_option: \'ALLOW_LOOSE\'\nsubstitutions:\n\t_SUFFIX: \'\"\" # Default to empty string if no suffix is provided' 
        }
      ],
      selectedOptionResponse: {
        subtitle: '\nVertex AI Agent Engine\n • Quick, easy solution for general reasoning \n   tasks (QA, summarization).\n • Managed scaling and infrastructure.\n\nCloud Run\n • Fine-grained control and customization.\n • Cost optimization and portability.\n • Requires container expertise, infrastructure \n   management, deployments, and the resources \n   to develop and maintain the infrastructure. ',
        caption: ''
      },
      hasNext: true,
      hasPrevious: true,
      hasHome: true,
      hasCode: true
    },
    {
      heading: 'Orchestration Framework',
      stepHeading: 'Framework',
      contentType: 'options',
      subheading: 'An AI orchestration framework manages workflows between AI models, tools, and data to build efficient AI systems.',
      options: [
        { 
          label: 'LangChain', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectFramework('langchain_agent'), 
          subtitle: 'LangChain is a popular open-source framework offering a comprehensive "toolbox" for building sophisticated applications powered by Large Language Models (LLMs). It provides a wide array of components and integrations to handle everything from prompts to memory.\n\nPros: Highly flexible and customizable for diverse LLM applications, supports a vast ecosystem of tools and models, and benefits from a large, active community.\n\nCons: Can be complex with a steeper learning curve due to its flexibility, may require more manual configuration, and its rapidly evolving nature can mean occasional API changes.',
          caption: 'from langchain_google_vertexai import VertexAI\nfrom langchain.agents import AgentExecutor, create_react_agent\n\n# Initialize the LLM\n\nllm = VertexAI(model_name="gemini-1.5-pro", temperature=0)\n\n# Load tools\ntools = ...\n\n# Initialize the agent\nreact_agent = create_react_agent(\n\tllm=llm,\n\ttools=tools,\n)\nagent_executor = AgentExecutor(\n\tagent=react_agent,\n\ttools=tools,\n\tverbose=True\n)\n\n# Run the agent\nresponse = agent_executor.invoke("What is the current weather in San Francisco?")\nprint(response)'
        },
        { 
          label: 'LangGraph', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectFramework('langgraph_agent'), 
          subtitle: 'LangGraph, building on LangChain, is designed for creating complex, stateful applications involving multiple interacting components (called "actors") using a graph-based structure. It excels at managing intricate, multi-step workflows common in advanced AI agents and dialogue systems.\n\nPros: Provides a structured way to manage complex logic and state across multiple interactions, ideal for sophisticated agents and workflows with decision points.\n\nCons: Requires more upfront design effort for the graph structure, can be overly complex for simple tasks, and its state management features add overhead if not strictly needed.',
          caption: 'from langgraph.graph import StateGraph, END\nfrom langchain_core.runnables import chain\nfrom langchain_google_vertexai import VertexAI\nfrom langchain_core.prompts import PromptTemplate\nfrom langchain_core.tools import tool\nfrom typing import TypedDict, List, Dict\nimport json\n\n# Define state\nclass AgentState(TypedDict):\n\tmessages: List[Dict]\n\tsteps: List[Dict]\n\n# Define tools (can be more sophisticated, like database connections)\n@tool\ndef get_current_weather(location: str) -> str:\n\t"""Useful to get the current weather in a given location"""\n\t# Simplified weather retrieval (replace with real API call)\n\treturn f"The weather in {location} is sunny with 25 degrees Celsius."\n\ntools = [get_current_weather]\n\n# Define LLM agent logic\ndef agent_logic(state: AgentState):\n\tllm = VertexAI(model_name="gemini-1.5-pro", temperature=0)\n\tprompt = PromptTemplate.from_template(\n\t\t"""You are a helpful assistant. Use the available tools to answer questions.\n\t\tAvailable tools: {tool_descriptions}\n\t\tQuestion: {question}"""\n\t)\n\n\ttool_names = [tool.name for tool in tools]\n\ttool_descriptions = \"\\n\".join([f"{tool.name}: {tool.description}" for tool in tools])\n\n\tprompt = prompt.partial(tool_names=", ".join(tool_names), tool_descriptions=tool_descriptions)\n\tchain = prompt | llm.bind_tools(tools)\n\t# Parse LLM response (simplified, assumes JSON output)\n\tresponse = chain.invoke({"question": state["messages"][-1]["content"]})\n\ttry:\n\t\tparsed_response = json.loads(response) # assumes a structured result\n\texcept:\n\t\tparsed_response = {"answer": response} # assumes a plain text result\n\treturn parsed_response\n\n# Define graph nodes\ndef agent_node(state: AgentState):\n\treturn agent_logic(state)\n\ndef should_continue(state: AgentState):\n\t# Logic to decide if the agent should continue (e.g., if it has enough info)\n\tif "answer" in state["steps"][-1]: # simplest possible logic: if last step has an answer\n\t\treturn "end" # Stop iterating\n\treturn "agent" # Continue iterating\n\n# Build the graph\ngraph_builder = StateGraph(AgentState)\ngraph_builder.add_node("agent", agent_node)\ngraph_builder.add_conditional_edges(\n\t"agent",\n\tshould_continue,\n\t{\n\t\t "end": END,\n\t\t"agent": "agent",\n\t},\n)\ngraph_builder.set_entry_point("agent")\ngraph = graph_builder.compile()\n\n# Run the graph\ninitial_state = {"messages": [{"content": "What is the weather in London?"}], "steps": []}\nfor output in graph.stream(initial_state):\n\tprint(output)'
        },
        { 
          label: 'LlamaIndex', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectFramework('llamaindex_agent'),
          subtitle: 'LlamaIndex is a framework specifically designed to connect Large Language Models (LLMs) to your own data sources (like documents, databases, and websites). It excels at indexing and retrieving this data so LLMs can use it effectively, making it ideal for applications requiring knowledge from specific documents or datasets.\n\nPros: Specializes in efficiently connecting LLMs to diverse data sources, offers simplified abstractions for data indexing and querying, and supports various vector databases. \n\nCons: Primarily focused on data ingestion and retrieval, offering less comprehensive tooling for broader LLM application development (like agent creation) compared to frameworks like LangChain, and its broad vector database support might mean less specific optimization for each one.',
          caption: 'from llama_index.agent import ReActAgent\nfrom llama_index.tools import QueryEngineTool, Tool\nfrom llama_index import VectorStoreIndex, SimpleDirectoryReader, ServiceContext\nfrom llama_index.llms import VertexAI\nfrom llama_index.embeddings import VertexAIEmbeddingModel\n\n# Load data (replace with your data loading)\ndocuments = SimpleDirectoryReader("data").load_data() # Assumes a "data" directory exists.\n\n# Configure LLM and embedding model\nllm = VertexAI(model="gemini-1.5-pro", temperature=0) # Replace with "gemini-pro" if needed\n\nembed_model = VertexAIEmbeddingModel(model_name="textembedding-gecko@003") #or a newer model if available\n\nservice_context = ServiceContext.from_defaults(llm=llm, embed_model=embed_model)\n\n# Create a VectorStoreIndex (replace with your data setup)\nindex = VectorStoreIndex.from_documents(documents, service_context=service_context)\n\n# Create a QueryEngineTool (This allows the agent to query the index you made)\nquery_engine = index.as_query_engine()\nquery_engine_tool = QueryEngineTool(\n\tquery_engine=query_engine,\n\tname="document_retriever",\n\tdescription="Useful for retrieving information from documents.",\n)\n\n# Define tools for the agent\ntools = [query_engine_tool]\n\n# Create the agent\nagent = ReActAgent.from_tools(tools=tools, llm=llm, verbose=True)\n\n# Query the agent\nquery = "What information is available on X?"  # Replace X with what you want to ask the document about\nresponse = agent.query(query)\n\nprint(response)' 
        },
        { 
          label: 'Vertex Agent Framework (Coming Soon)', 
          isSelected: false,
          isDisabled: true, 
          onClick: () => this.selectFramework('Vertex Agent Framework'),
          subtitle: 'The Vertex AI Agent Framework is a new tool (currently in preview) that allows developers to build and deploy agents that use LLMs to connect with APIs, data, and other applications. It simplifies the creation of agents that can automate tasks, retrieve information, and interact with the world.',
          caption: 'from google.cloud import aiplatform \n\n# Initialize the Vertex AI client \naiplatform.init(project="your-project-id", location="your-region") \n\n# Create an agent \nagent = aiplatform.Agent.create( \ndisplay_name="my-agent", llm_model="text-bison@001", tools=[aiplatform.Tool.from_python_package( \ndisplay_name="wikipedia", python_package_uri="gs://my-bucket/wikipedia.tar.gz", )] )' 
        }
      ],
      selectedOptionResponse: {
        subtitle: '\n • LangChain: Versatile toolbox for building a wide \n   range of LLM applications.\n • LangGraph: Build complex, stateful, multi-actor \n   LLM workflows with a structured graph \n   approach. \n • LlamaIndex: Connect LLMs to your private data \n   for efficient indexing and retrieval.\n • Vertex AI Agent Framework: Streamlined \n   Python SDK for developing generative AI agents \n   (coming soon!) \n\nSelect the framework best suited to your project: LangChain for general use, LangGraph for complex workflows, and LlamaIndex for private data.',
        caption: ''
      },
      hasNext: true,
      hasPrevious: true,
      hasHome: true,
      hasCode: true
    },

    {
      heading: 'Industry',
      stepHeading: 'Industry',
      contentType: 'industry',
      subheading: 'AI tools are software applications or platforms that leverage artificial intelligence to automate tasks, analyze data, or generate outputs.',
      options: [
        { 
          label: 'Finance', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectIndustry('finance'), 
          subtitle: 'Your finance agent has been configured with the following use case and tools:',
          metadata: {
            usecase: "Use case",
            usecaseHeading: "AI-Powered Investment Research Analyst for Alphabet",
            usecaseSubheading: "Provides financial insights on Alphabet by analyzing its financial reports, strategic initiatives, and management perspectives from its historical investor documents. (Disclaimer: This Agent is for demonstration purposes only)",
            tool: "Tool",
            toolHeading: "retrieve_info",
            toolSubheading: "This tool uses Vertex AI Search to perform Retrieval Augmented Generation (RAG) on a given dataset. This agent has access to the following dataset:\n\n`Alphabet Investor PDFs`: This dataset contains PDFs of quarterly earnings releases and annual reports for Alphabet for every quarter since 2004. The Annual reports include  financial statements (balance sheet, income statement, cash flow statement), a letter to shareholders, management discussion and analysis (MD&A), and information on corporate governance. The quarterly earnings releases also contain key financial statements like the income statement, balance sheet, and cash flow statement, along with management commentary and analysis of quarterly performance.",
          },
          caption: 'from langchain.agents import Tool \n\n# Define the tool (assuming \'get_weather\' function is already defined) \nweather_tool = Tool( \n\tname="Get Weather", \n\tfunc=get_weather, \n\tdescription="Get current weather for a location." \n)'
        },
        { 
          label: 'Healthcare', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectIndustry('healthcare'),
          subtitle: 'Your healthcare agent has been configured with the following use case and tools:',
          metadata: {
            usecase: "Use case",
            usecaseHeading: "Symptom Checker and Triage Assistant",
            usecaseSubheading: "Analyzes general medical symptoms and acts as a virtual assistant to help triage patients to the appropriate level of care during consultations. (Disclaimer: This Agent is for demonstration purposes only and is NOT a substitute for professional medical advice)",
            tool: "Tool",
            toolHeading: "medical_publications_tool",
            toolSubheading: "Utilizes the PubMed API to pull data from the PubMed database, which is a free, searchable database developed and maintained by the National Center for Biotechnology Information (NCBI) and provides access to citations and abstracts of biomedical literature.\n\nretrieve_info: This tool uses Vertex AI Search to perform Retrieval Augmented Generation (RAG) on a given dataset. This agent has access to the following dataset:\n\n`PriMock57 Healthcare consultations`: This dataset consists of 57 mock medical primary care consultations held over 5 days by 7 clinicians and 57 fake patients, using case cards that present complaints, symptoms, medical & general history etc.",
          },
          caption: 'from langchain.agents import load_tools \n\n# Load the pre-built Google Search tool \ntools = load_tools(["google-search"]) \n\n# Use the tool (e.g., within an agent) \ntools[0].run("What\'s the weather in Boston, MA?")' 
        },
        { 
          label: 'Retail', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectIndustry('retail'),
          subtitle: 'Your retail agent has been configured with the following use case and tools:',
          metadata: {
            usecase: "Use case",
            usecaseHeading: "Google Product Discovery Assistant",
            usecaseSubheading: "Answers product-specific questions on Google Products available on the Google Store (Disclaimer: This Agent is for demonstration purposes only)",
            tool: "Tool",
            toolHeading: "retrieve_info",
            toolSubheading: "This tool uses Vertex AI Search to perform Retrieval Augmented Generation (RAG) on a given dataset. This agent has access to the following dataset:\n\n`Google Store`: This data is a list of html web pages from the Google Store from\n2023. It represents a listing of products, details, prices, etc related to\nGoogle products.",
          },
          caption: 'from langchain.agents import load_tools \n\n# Load the pre-built Google Search tool \ntools = load_tools(["google-search"]) \n\n# Use the tool (e.g., within an agent) \ntools[0].run("What\'s the weather in Boston, MA?")' 
        },
      ],
      selectedOptionResponse: {
        subtitle: '\nAPIs offer flexibility and customization, allowing developers to tailor LLM interactions precisely to their needs and integrate them deeply within existing systems.  Pre-built tools, on the other hand, provide convenience and speed, offering ready-made solutions for common LLM use cases like chatbots, summarization, or question answering, often with user-friendly interfaces and requiring less coding.  Choose APIs when fine-grained control and deep integration are paramount, and pre-built tools when rapid development and ease of use are prioritized.',
        caption: '',
        metadata: {
          usecase: "",
          usecaseHeading: "",
          usecaseSubheading: "",
          tool: "",
          toolHeading: "",
          toolSubheading: "",
        },
      },
      hasNext: true,
      hasPrevious: true,
      hasHome: true,
      hasCode: true
    },
    {
      heading: 'Model',
      stepHeading: 'Model',
      contentType: 'options',
      subheading: 'AI models are algorithms trained on data to recognize patterns and make predictions or decisions without explicit programming.',
      options: [
        { 
          label: 'Gemini 2.0 Flash', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectModel('gemini-2.0-flash'), 
          subtitle: 'Gemini 2.0 Flash is a fast, efficient, and cost-effective AI model perfect for tasks needing quick responses and high volume. It excels at answering simple questions, providing instant information, real-time chat support, basic reasoning, and connecting your requests to other tools via APIs. Think of it for uses like a customer service chatbot handling common questions rapidly and affordably.\n\nPros: Speed, efficiency, low cost, good for quick lookups and simple reasoning.\n\nCons: Less suitable for highly complex reasoning, deep analysis, or tasks requiring the utmost accuracy on nuanced problems compared to larger, more powerful models.',
          caption: 'import os\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_google_vertexai import ChatVertexAI\n\nos.environ["GOOGLE_CLOUD_PROJECT"] = "your-project-id"\n\ngemini_flash = ChatVertexAI(\n\tmodel_name="gemini-2.0-flash",\n\ttemperature=0.2, # Adjust for creativity\n\tmax_output_tokens=256, # Larger limit for complex tasks\n\tlocation="us-central1"\n)\n\nprompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")\nchain = prompt | gemini_flash | StrOutputParser()\nprint("Gemini Flash Joke: ", chain.invoke({"topic": "cats"}))'
        },
        { 
          label: 'Gemini 1.5 Pro', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectModel('gemini-1.5-pro'), 
          subtitle: 'Gemini 1.5 Pro is a powerful AI model with a massive capacity for understanding long and complex information, making it excellent for deep analysis, generating detailed content, and handling multiple types of data (text, images, etc.). Its ability to process millions of pieces of information at once unlocks advanced reasoning and comprehensive understanding across large datasets.\n\nPros: Handles huge amounts of information, strong reasoning for complex tasks, understands multiple data types, remembers past interactions.\n\nCons: Likely slower and more expensive to run than "flash" models, potentially overkill for simple, quick tasks.',
          caption: 'import os\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_google_vertexai import ChatVertexAI\n\nos.environ["GOOGLE_CLOUD_PROJECT"] = "your-project-id"\n\ngemini_pro = ChatVertexAI(\n\tmodel_name="gemini-1.5-pro-latest",\n\ttemperature=0.7, # Adjust for creativity\n\tmax_output_tokens=1024, # Larger limit for complex tasks\n\tlocation="us-central1"\n)\n\nprompt = ChatPromptTemplate.from_template("Summarize this article: {article}")\nchain = prompt | gemini_pro | StrOutputParser()\n\narticle_text = "A very long article about AI..." # Replace with your article\nprint("Gemini Pro Summary: ", chain.invoke({"article": article_text}))'
        },
        { 
          label: 'Claude 3.7 Sonnet (Model Garden)', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectModel('claude-3-7-sonnet'),
          subtitle: 'Claude 3.7 Sonnet is Anthropic\'s most intelligent model, uniquely offering "extended thinking" for tackling complex problems with step-by-step reasoning, alongside standard thinking for quicker responses. It is available in the Vertex AI Model Garden. This model intelligently balances speed and quality, making it a versatile choice for advanced tasks requiring nuanced understanding and careful execution. \n\nPros: Excellent natural language and conversational skills, strong creative writing, excels at agentic coding and complex workflows, good safety features, understands nuance and tone well.\n\nCons: "Extended thinking" might have slightly longer response times than its standard mode, and as a premium model, it may have higher usage costs compared to less capable options.',
          caption: 'import os\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_google_vertexai.model_garden import ChatAnthropicVertex\n\nos.environ["GOOGLE_CLOUD_PROJECT"] = "your-project-id"\n\n# requires permission / approving Anthropic\’s; must be us-east5 or europe-west1\nclaude_sonnet = ChatAnthropicVertex(\n\tmodel_name="claude-3-7-sonnet",\n\ttemperature=0.5, # Adjust for creativity\n\tmax_tokens=500, # Larger limit for complex tasks\n\tlocation="us-east5"\n)\n\nprompt = ChatPromptTemplate.from_template("Write a poem about {subject}")\n\nchain = prompt | claude_sonnet | StrOutputParser()\nprint("Claude Sonnet Poem: ", chain.invoke({"subject": "rain"}))' 
        },
        { 
          label: 'Claude 3.5 Sonnet V2 (Model Garden)', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectModel('claude-3-5-sonnet-v2'),
          subtitle: 'Claude 3.5 Sonnet v2, available in the Vertex AI Model Garden, is a state-of-the-art model from Anthropic, excelling in real-world software engineering and tasks requiring intelligent agent behavior. It offers a strong combination of natural language understanding, coding abilities, and advanced reasoning, making it versatile for complex applications.\n\nPros: Excellent for agent tasks and tool use, strong coding capabilities (planning, fixing, migration), great for document Q&A with nuanced understanding, good balance of creativity and speed for conversations.\n\nCons: Might not match the very highest reasoning capabilities of newer models for the most demanding challenges, and users should weigh its performance against specific cost and speed requirements.',
          caption: 'import os\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_google_vertexai.model_garden import ChatAnthropicVertex\n\nos.environ["GOOGLE_CLOUD_PROJECT"] = "your-project-id"\n\n# requires permission / approving Anthropic’s T&C; must be us-east5 or europe-west1\nclaude_sonnet = ChatAnthropicVertex(\n\tmodel_name="claude-3-5-sonnet-v2",\n\ttemperature=0.5, # Adjust for creativity\n\tmax_tokens=500, # Larger limit for complex tasks\n\tlocation="us-east5"\n)\n\nprompt = ChatPromptTemplate.from_template("Write a poem about {subject}")\nchain = prompt | claude_sonnet | StrOutputParser()\n\nprint("Claude Sonnet Poem: ", chain.invoke({"subject": "rain"}))' 
        },
        { 
          label: 'Llama 3.3 70B (Model Garden)', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectModel('llama-3.3-70b-instruct-maas'),
          subtitle: 'Llama 3.3 70B, available in the Vertex AI Model Garden, is a powerful open-source model known for its strong performance and broad applicability, offering the key advantage of being fine-tunable for specific needs. Its open nature and customizability make it an excellent choice when you need control over the model and are targeting specialized tasks.\n\nPros: Open source, highly customizable via fine-tuning, strong general performance, good for resource-constrained environments, excellent for prototyping.\n\nCons: Requires time and data to fine-tune for optimal performance on specific tasks, and ongoing maintenance is needed.',
          caption: 'import os\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_google_vertexai import ChatVertexAI\n\nos.environ["GOOGLE_CLOUD_PROJECT"] = "your-project-id"\n\ngemini_pro = ChatVertexAI(\n\tmodel_name="llama-3.3-70b-instruct-maas",# requires the model to be enabled\n\ttemperature=0.7, # Adjust for creativity\n\tmax_output_tokens=1024, # Larger limit for complex tasks\n\tlocation="us-central1"\n)\n\nprompt = ChatPromptTemplate.from_template("Translate the following text to Spanish: {text}")\nchain = prompt | llama_model | StrOutputParser()\nprint("Llama Translation: ", chain.invoke({"text": "Hello, how are you?"}))' 
        },
        { 
          label: 'Llama 3.1 405B (Model Garden)', 
          isSelected: false, 
          isDisabled: false,
          onClick: () => this.selectModel('llama-3.1-405b-instruct-maas'),
          subtitle: 'Llama 3.1 405B is a massive, open-source AI model designed for tackling the most demanding problems that require an exceptional depth of understanding and highly complex reasoning. Its immense capacity and open nature make it ideal for pushing the boundaries of AI research and creating extremely specialized agents, though fine-tuning is typically essential.\n\nPros: Unrivaled capacity for extremely complex reasoning, profound potential for deep understanding, open source, customizable, ideal for cutting-edge research and highly specialized, demanding tasks.\n\nCons: Will be very slow and extremely resource-intensive (very high cost/latency), requires substantial investment and expertise for deployment and fine-tuning for optimal performance.',
          caption: 'import os\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_google_vertexai import ChatVertexAI\n\nos.environ["GOOGLE_CLOUD_PROJECT"] = "your-project-id"\n\ngemini_pro = ChatVertexAI(\n\tmodel_name="llama-3.1-405b-instruct-maas",# requires the model to be enabled\n\ttemperature=0.2, # Adjust for creativity\n\tmax_output_tokens=1024, # Larger limit for complex tasks \n\tlocation="us-central1"\n)\n\nprompt = ChatPromptTemplate.from_template("Translate the following text to Spanish: {text}")\nchain = prompt | llama_model | StrOutputParser()\nprint("Llama Translation: ", chain.invoke({"text": "Hello, how are you?"}))' 
        }
      ],
      selectedOptionResponse: {
        subtitle: '\nThe foundation model is the core of your AI agent, interpreting information and driving its decisions and actions. Choosing the right one is crucial. \n\nConsider the tasks your agent will handle, required accuracy, budget, speed needs, and if you need customization. \n\nAlso, think about the model\'s context window for handling complex tasks and whether a faster, cheaper \"flash\" model suits your speed and cost requirements.',
        caption: ''
      },
      hasNext: false,
      hasPrevious: true,
      hasHome: true,
      hasSubmit: true,
      hasCode: false
    }
  ];

  ngOnInit() {
    this.formGroup = this._formBuilder.group({
      formArray: this._formBuilder.array([
        this._formBuilder.group({
          agentName: ['', Validators.required],
          description: ['', Validators.required],
        }),
        this._formBuilder.group({
          runTime: ['', Validators.required] // Add validators for radio button groups
        }),
        this._formBuilder.group({
          framework: ['', Validators.required]
        }),
        this._formBuilder.group({
          industry: ['', Validators.required]
        }),
        this._formBuilder.group({
          model: ['', Validators.required]
        }),
      ])
    });
  }

  isStepValid(index: number): boolean {
    const formArray = this.formGroup.get('formArray') as FormArray;
    const stepFormGroup = formArray.at(index) as FormGroup;
    // console.log('Step Form Group:', stepFormGroup); // Log the form group
    if (stepFormGroup) {
      // console.log('Step Form Group Validity:', stepFormGroup.valid); // Log the validity
      return stepFormGroup.valid;
    }
    console.log('Step is not a form, returning true');
    return true;
  }
  
  selectRunTime(value: string) {
    this.selectedRuntime = value as Runtime;
  }

  selectFramework(value: string) {
    this.selectedFramework = value as Framework;
  }

  selectIndustry(value: string) {
    this.selectedIndustry = value as Industry;
  }

  selectModel(value: string) {
    this.selectedModel = value as Model;
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  onRadioChange(section: any, selectedOption: any, stepIndex: number) {
    section.subheading = "";
    section.options.forEach((option: { isSelected: boolean; }) => {
      option.isSelected = option === selectedOption; 
    });
    section.selectedOptionResponse = {
      subtitle : selectedOption.subtitle,
      caption: selectedOption.caption,
      metadata: selectedOption.metadata
    }
    selectedOption.onClick(); 

    // Update form group value for radio button selection
    const formArray = this.formGroup.get('formArray') as FormArray;
    formArray.at(stepIndex).patchValue({  // Use stepIndex to target correct form group
      runTime: this.selectedRuntime,       // Update with selected value
      framework: this.selectedFramework,
      industry: this.selectedIndustry,
      model: this.selectedModel
    });
    // console.log(formArray);
    formArray.at(stepIndex).markAsDirty();
  }

  goToSpinnerComponent() {
    localStorage.setItem("agentData",JSON.stringify(this.formGroup.value.formArray));
    this.agentConfigurationService.save(this.getFormValues());
    this.router.navigate(['/spinner']);
  }

  getFormValues(): AgentConfiguration {
    const formArray = this.formGroup.get('formArray') as FormArray;
    const firstStepGroup = formArray.at(0) as FormGroup;

    return {
      name: firstStepGroup.get("agentName")!.value,
      description: firstStepGroup.get("description")!.value,
      runTime: this.selectedRuntime,
      framework: this.selectedFramework,
      industry: this.selectedIndustry,
      model: this.selectedModel,
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  openViewCodeModal(record: any) {
    this.dialog.open(CodeDialogComponent, { width: '100%', maxWidth:'1000px', data: { content: record.caption }, });
  }

  openHelpModal() {
    this.dialog.open(HowItWorksDialogComponent,{ width: '100%',maxWidth:'1200px', data: { url: this.howItWorks, content: this.howItWorksDescription }, });
  }
  
}

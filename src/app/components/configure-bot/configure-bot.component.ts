import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-configure-bot',
  templateUrl: './configure-bot.component.html',
  styleUrl: './configure-bot.component.scss'
})
export class ConfigureBotComponent {
  formGroup: FormGroup;
  selectedRuntime: string = 'resoningEngine';
  selectedFramework: string = 'langchain';
  selectedTools: string = 'api';
  selectedModel: string = 'gemini';
  @ViewChild('viewCode', { static: true })
  viewCode: TemplateRef<{}>;
  viewCodeDialogRef?: MatDialogRef<{}>;


  constructor(private _formBuilder: FormBuilder, 
    private router: Router, private fb: FormBuilder
    , private themeService: ThemeService,private readonly dialog: MatDialog,) { 
    // this.formGroup = this.fb.group({
    //   formArray: this.fb.array([
    //     this.fb.group({
    //       agentName: [''],
    //       description: [''],
    //       agentType: [''],
    //       industry: ['']
    //     }),
    //     this.fb.group({ /* runtime controls */ }),
    //     this.fb.group({ /* other controls */ })
    //   ])
    // });
  }

  get formArray(): AbstractControl | null { return this.formGroup.get('formArray'); }

  stepperConfig = [
    {
      heading: 'Agent Properties',
      stepHeading: 'Properties',
      contentType: 'form',
      fields: [
        { label: 'Agent Name', type: 'input', controlName: 'agentName', placeholder: '', required: true },
        { label: 'Description', type: 'input', controlName: 'description', placeholder: '', required: true },
        { label: 'Agent Type', type: 'select', controlName: 'agentType', options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2', disabled: true },
          { value: 'option3', label: 'Option 3' }
        ] },
        { label: 'Industry', type: 'select', controlName: 'industry', options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2', disabled: true },
          { value: 'option3', label: 'Option 3' }
        ] }
      ],
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
      options: [
        { 
          label: 'Vertex AI Reasoning Engine', 
          isSelected: false, 
          onClick: () => this.selectRunTime('Vertex AI Reasoning Engine'), 
          subtitle: 'Vertex AI Reasoning Engine is a specialized service for deploying and running machine learning models, with features such as model monitoring, versioning, and A/B testing.',
          caption: '# Initialize the Vertex AI client \naiplatform.init(project="your-project-id", location="your-region")\n\n# Deploy a model to the Vertex AI Reasoning Engine \nmodel = aiplatform.Model.upload( \n\tdisplay_name="your-model-name", \n\tartifact_uri="gs://your-bucket/your-model-path", \n\tserving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/your-\ncontainer-image", ) endpoint = model.deploy( machine_type="n1-standard-4", )'
        },
        { 
          label: 'Cloud Run', 
          isSelected: false, 
          onClick: () => this.selectRunTime('Cloud Run'),
          subtitle: 'Cloud Run is a general-purpose service for deploying and running any containerized application, including web applications, APIs, and microservices.',
          caption: 'apiVersion: serving.knative.dev/v1 \nkind: Service \nmetadata: \n\tname: your-service-name \nspec: \n\ttemplate: \n\t\tspec: \n\t\t\tcontainers: \n\t\t\t\t-image: us-docker.pkg.dev/cloudrun/container/hello \n\t\t\tports: \n\t\t\t\t-containerPort: 8080' 
        }
      ],
      selectedOptionResponse: {
        subtitle: 'An AI runtime provides the necessary environment to deploy and run machine learning models.\n\nVertex AI\n • Quick, easy solution for general reasoning tasks (QA, summarization).\n • Managed scaling and infrastructure.\n\nCloud Run\n • Fine-grained control and customization.\n • Cost optimization and portability.\n • Requires container expertise and infrastructure \n   management.deployments, and the resources to \n   develop and maintain the infrastructure. ',
        caption: '# Initialize the Vertex AI client \naiplatform.init(project="your-project-id", location="your-region")\n\n# Deploy a model to the Vertex AI Reasoning Engine \nmodel = aiplatform.Model.upload( \n\tdisplay_name="your-model-name", \n\tartifact_uri="gs://your-bucket/your-model-path", \n\tserving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/your-\ncontainer-image", ) endpoint = model.deploy( machine_type="n1-standard-4", )'
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
      options: [
        { 
          label: 'Langchain/Langgraph', 
          isSelected: false, 
          onClick: () => this.selectFramework('Langchain/Langgraph'), 
          subtitle: 'LangChain (with its visual counterpart LangGraph) is a framework for building applications with large language models (LLMs). It provides tools to chain together LLMs with other components, like prompts and external data sources, to create complex applications.',
          caption: 'from langchain.llms import Gemini \nfrom langchain.prompts import PromptTemplate \n\nllm = Gemini(model="gemini-pro", temperature=0.9) # Using Gemini Pro \nprompt = PromptTemplate( \n\tinput_variables=["product"], \n\ttemplate="What is a good name for a company that makes {product}?", \n) \nprint(llm(prompt.format(product="colorful socks")))'
        },
        { 
          label: 'LlamaIndex', 
          isSelected: false, 
          onClick: () => this.selectFramework('LlamaIndex'),
          subtitle: 'LlamaIndex (formerly GPT Index) is a data framework that helps you connect your external data to large language models (LLMs). It provides tools for structuring, indexing, and querying your data sources, allowing LLMs to access and utilize this information effectively.',
          caption: 'from llama_index import SimpleDirectoryReader, GPTListIndex, LLMPredictor, \nServiceContext \nfrom langchain.llms import Gemini \n\ndocuments = SimpleDirectoryReader(\'data\').load_data() \nindex = GPTListIndex.from_documents(documents) \n\n# Define LLM and service context using Gemini \nllm_predictor = LLMPredictor(llm=Gemini(model="gemini-pro", temperature=0)) \nservice_context = ServiceContext.from_defaults(llm_predictor=llm_predictor) \nquery_engine = index.as_query_engine(service_context=service_context) \nresponse = query_engine.query("What is the main topic?") \nprint(response)' 
        },
        { 
          label: 'Vertex Agent Framework', 
          isSelected: false, 
          onClick: () => this.selectFramework('Vertex Agent Framework'),
          subtitle: 'The Vertex AI Agent Framework is a new tool (currently in preview) that allows developers to build and deploy agents that use LLMs to connect with APIs, data, and other applications. It simplifies the creation of agents that can automate tasks, retrieve information, and interact with the world.',
          caption: 'from google.cloud import aiplatform \n\n# Initialize the Vertex AI client \naiplatform.init(project="your-project-id", location="your-region") \n\n# Create an agent \nagent = aiplatform.Agent.create( \ndisplay_name="my-agent", llm_model="text-bison@001", tools=[aiplatform.Tool.from_python_package( \ndisplay_name="wikipedia", python_package_uri="gs://my-bucket/wikipedia.tar.gz", )] )' 
        }
      ],
      selectedOptionResponse: {
        subtitle: 'LangChain is best for orchestrating complex LLM workflows, LlamaIndex simplifies connecting LLMs to external data sources, and Vertex AI provides a comprehensive platform for building and deploying LLM-powered applications.  Choose LangChain for intricate agent behaviors, LlamaIndex for knowledge-based applications, and Vertex AI for production-ready deployments within the Google Cloud ecosystem.',
        caption: 'from langchain.llms import Gemini \nfrom langchain.prompts import PromptTemplate \n\nllm = Gemini(model="gemini-pro", temperature=0.9) # Using Gemini Pro \nprompt = PromptTemplate( \n\tinput_variables=["product"], \n\ttemplate="What is a good name for a company that makes {product}?", \n) \nprint(llm(prompt.format(product="colorful socks")))'
      },
      hasNext: true,
      hasPrevious: true,
      hasHome: true,
      hasCode: true
    },

    {
      heading: 'Tools',
      stepHeading: 'Tools',
      contentType: 'options',
      options: [
        { 
          label: 'API', 
          isSelected: false, 
          onClick: () => this.selectTools('API'), 
          subtitle: 'An API allows the LLM to interact with external services and retrieve information or perform actions. This expands the LLM\'s capabilities beyond just generating text, enabling it to access real-time data, interact with other applications, and perform a wider range of tasks.',
          caption: 'from langchain.agents import Tool \n\n# Define the tool (assuming \'get_weather\' function is already defined) \nweather_tool = Tool( \n\tname="Get Weather", \n\tfunc=get_weather, \n\tdescription="Get current weather for a location." \n)'
        },
        { 
          label: 'Pre-build Tool', 
          isSelected: false, 
          onClick: () => this.selectTools('Pre-build Tool'),
          subtitle: '"Pre-built" tools for LLMs are ready-made components that provide easy access to common functionalities and services, like searching the web or accessing specific APIs. These tools are pre-configured and often come bundled with platforms like LangChain, allowing developers to quickly integrate them into their applications without building everything from scratch.',
          caption: 'from langchain.agents import load_tools \n\n# Load the pre-built Google Search tool \ntools = load_tools(["google-search"]) \n\n# Use the tool (e.g., within an agent) \ntools[0].run("What\'s the weather in Boston, MA?")' 
        },
        { 
          label: 'TBD', 
          isSelected: false, 
          onClick: () => this.selectTools('TBD'),
          subtitle: 'Tempus interdum tincidunt suspendisse pulvinar. In habitant lorem quis viverra. Cum facilisi sit scelerisque mi sed porttitor mauris. Adipiscing pellentesque lobortis eget amet lectus. Nulla a et sit at id massa purus volutpat urna. Accumsan.',
          caption: 'aiplatform.init(project="your-project-id", location="your-region") \nllm = VertexAI(model_name="text-bison@001") \nagent = "Agent description here" \nremote_agent = aiplatform.reasoning_engines.ReasoningEngine.create( \n\tagent=agent, \n\trequirements=[ "google-cloud-aiplatform[langchain,reasoningengine]", \n\t"cloudpickle==3.0.0", "pydantic==2.7.4", "langchain-google-community", "google-cloud-discoveryengine", ], \n)' 
        }
      ],
      selectedOptionResponse: {
        subtitle: 'APIs offer flexibility and customization, allowing developers to tailor LLM interactions precisely to their needs and integrate them deeply within existing systems.  Pre-built tools, on the other hand, provide convenience and speed, offering ready-made solutions for common LLM use cases like chatbots, summarization, or question answering, often with user-friendly interfaces and requiring less coding.  Choose APIs when fine-grained control and deep integration are paramount, and pre-built tools when rapid development and ease of use are prioritized.',
        caption: 'from langchain.agents import Tool \n\n# Define the tool (assuming \'get_weather\' function is already defined) \nweather_tool = Tool( \n\tname="Get Weather", \n\tfunc=get_weather, \n\tdescription="Get current weather for a location." \n)'
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
      options: [
        { 
          label: 'Gemini', 
          isSelected: false, 
          onClick: () => this.selectModel('Gemini'), 
          subtitle: 'Gemini is a family of large language models (LLMs) from Google AI, capable of text generation, code generation, translation, and question answering.',
          caption: 'from langchain.llms import Gemini \n\nllm = Gemini(model="gemini-pro") \nresponse = llm("Tell me a joke.") \nprint(response)'
        },
        { 
          label: 'Claude (Model Garden)', 
          isSelected: false, 
          onClick: () => this.selectModel('Claude (Model Garden)'),
          subtitle: 'Claude is a large language model created by Anthropic, focused on being helpful, harmless, and honest. You can use Claude for tasks like summarizing articles or documents, engaging in natural-sounding conversations, generating different kinds of text formats, and providing informative answers to your questions.',
          caption: 'import anthropic \n\nclient = anthropic.Anthropic() \nresponse = client.completions.create( \n\tmodel="claude-2", \n\tprompt="Write a short poem about the ocean." \n) \nprint(response.completion)' 
        }
      ],
      selectedOptionResponse: {
        subtitle: 'Gemini is Google\'s multimodal LLM, excelling at tasks involving text, images, and code, and integrates well with Google services. Claude, from Anthropic, prioritizes safety and aims for less harmful outputs. Choose Gemini for multimodal needs and Google integration, Claude for a focus on safety.',
        caption: 'from langchain.llms import Gemini \n\nllm = Gemini(model="gemini-pro") \nresponse = llm("Tell me a joke.") \nprint(response)'
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
          agentType: ['', Validators.required],
          industry: ['', Validators.required],
        }),
        this._formBuilder.group({
          runTime: ['', Validators.required] // Add validators for radio button groups
        }),
        this._formBuilder.group({
          framework: ['', Validators.required]
        }),
        this._formBuilder.group({
          tools: ['', Validators.required]
        }),
        this._formBuilder.group({
          model: ['', Validators.required]
        }),
      ])
    });
  }
  
  selectRunTime(value: string) {
    console.log(value);
    this.selectedRuntime = value;
  }

  selectFramework(value: string) {
    console.log(value);
    this.selectedFramework = value;
  }

  selectTools(value: string) {
    console.log(value);
    this.selectedTools = value;
  }

  selectModel(value: string) {
    console.log(value);
    this.selectedModel = value;
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  onRadioChange(section: any, selectedOption: any, stepIndex: number) {
    section.options.forEach((option: { isSelected: boolean; }) => {
      option.isSelected = option === selectedOption; 
    });
    section.selectedOptionResponse = {
      subtitle : selectedOption.subtitle,
      caption: selectedOption.caption
    }
    selectedOption.onClick(); 

    // Update form group value for radio button selection
    const formArray = this.formGroup.get('formArray') as FormArray;
    formArray.at(stepIndex).patchValue({  // Use stepIndex to target correct form group
      runTime: this.selectedRuntime,       // Update with selected value
      framework: this.selectedFramework,
      tools: this.selectedTools,
      model: this.selectedModel
    });
    console.log(formArray);
    formArray.at(stepIndex).markAsDirty();
  }

  goToSpinnerComponent() {
    this.submitForm();
    this.router.navigate(['/spinner']);
  }

  submitForm() {
    console.log(this.formGroup.value);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  openViewCodeModal(record: any) {
    this.viewCodeDialogRef = this.dialog.open(this.viewCode, { width: '500px', data: record });

  }
  
}

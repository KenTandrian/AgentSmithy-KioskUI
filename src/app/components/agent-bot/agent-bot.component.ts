import { Component, EventEmitter, inject, OnDestroy, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';
import { Message, SuggestionData } from '../../models/messegeType.model';
import { ChatService } from '../../services/chat.service';
import { BroadcastService } from '../../services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { SpeechToTextService } from '../../services/speech-to-text';
import { HttpClient, HttpDownloadProgressEvent, HttpEvent, HttpEventType } from '@angular/common/http';
import { Chat } from '../../models/chat.model';
import { HowItWorksDialogComponent } from '../how-it-works-dialog/how-it-works-dialog.component';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { AgentConfigurationService } from '../../services/agent-configuration.service';
import { AgentConfiguration } from '../../models/agent';


export type DialogQuestion = {
  questionId: string,
  questionText: string,
  hasChip: boolean,
  options: string[],
  questionSequence: string,
  answer: string
}

@Component({
  selector: 'app-agent-bot',
  templateUrl: './agent-bot.component.html',
  styleUrl: './agent-bot.component.scss'
})
export class AgentBotComponent implements OnInit, OnDestroy {
  @Output() onSubmit: EventEmitter<any> = new EventEmitter();

  private analytics = inject(Analytics);
  private agentConfigurationService = inject(AgentConfigurationService);

  agentConfiguration: AgentConfiguration;
  isSuggestedQuestion: string = '';
  chatQuery: string;
  chatQuery$: Observable<Message>;
  showLoader: boolean = false;
  isSendIconDisabled: boolean = true;
  startTimer: boolean = false;
  conversation: Message[] = [];
  leftContainerClass = "";
  rightContainerClass = "";
  index = 2;
  loaderTextArray: string[] = [
    $localize`I am a conversation bot built on Google Cloud's Vertex AI tools.`,
    $localize`Tool Tip: You can reset the conversation anytime using the reset button next the the text input box.`,
    $localize`Joke : Why did the robot go on a diet? Because it had too many bytes!`,
    $localize`Joke : Why can't bicycles stand up by themselves? Because they are two-tired!`,
    $localize`Joke : How does a computer get drunk? It takes screenshots.`
  ];
  loaderTextTimeout: undefined | ReturnType<typeof setTimeout>;
  loaderText = "";
  loaderTextIndex = 0;
  loaderIndex = 1;
  isChatDisabled: boolean = false;
  botStartTime: number;
  initialQuestion: string;
  ticketId: string;
  categoryIntent: string = "";
  changeImageInterval: undefined | ReturnType<typeof setTimeout>;
  panelOpenState = false;
  like = false;
  dislike = false;
  response: Response
  loaderSelectedChip = '';
  showLoaderLikeDislikeButtons = false;
  outOfContextAnswerResponseObject = {
    like: false,
    dislike: false
  }
  showSuggesstion = false;
  suggestedQuestionMessage: Message;
  loader_chat_id: any;
  questionArray: any[] = [];

  /** DEP accordion border colors */
  borderColors = ['#4285F4', '#0F9D58', '#F4B400', '#DB4437'];

  private readonly destroyed = new ReplaySubject<void>(1);
  isRecording = false;
  transcribedText = '';
  mediaRecorder: MediaRecorder;
  audioChunks: Blob[] = [];
  selectedAgentData:any;
  chatsUrl: string;
  botsMappingData: any;
  botsMap = new Map();
  botUrl: string;
  isGeneric: boolean = false;
  safeBotUrl: SafeResourceUrl;
  subtitle: string;
  question1: string;
  question2: string;
  question3: string;
  @ViewChild('chatTextarea') textarea: ElementRef;

  constructor(
    public dialog: MatDialog,
    private chatService: ChatService,
    public userService: UserService,
    private broadcastService: BroadcastService,
    private speechToTextService: SpeechToTextService,
    private router: Router,
    private httpClient: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    this.agentConfiguration = this.agentConfigurationService.get();
    logEvent(
      this.analytics, "/chat_preview",
      {
        ...this.getAgentConfigurationDefinitions()
      },
    );
    this.chatQuery$ = this.broadcastService.chatQuery$
    this.chatQuery$.subscribe((value: any) => {
      this.conversation.push(value);
    });
    this.loaderText = this.loaderTextArray[Math.round(Math.random() * 10)];
    this.checkIfMessege();
  }

  setupMediaRecorder(stream: MediaStream) {
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = event => this.audioChunks.push(event.data);
    this.mediaRecorder.onstop = () => this.sendAudioToGCP();
  }

  async sendAudioToGCP() {
    const audioBlob = new Blob(this.audioChunks);
    (await this.speechToTextService.transcribeAudio(audioBlob)).subscribe(
      (response: any) => {
        this.chatQuery = response[0]
      },
      (error: any) => {
      }
    );
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  getStringData(obj: any): string {
    let str = (obj as string);
    if (str === "" || str.length === 0) {
      return $localize`Sorry! I don't have sufficient information to answer this question at the moment.`;
    }
    return (obj as string);
  }


  getSuggestionData(obj: any): SuggestionData {
    return (obj as SuggestionData);
  }

  checkIfMessege() {
    if (this.conversation.length == 1 && this.conversation[0].type == 'user') {
      this.showLoader = true;
      this.setTimeoutForLoaderText();
      this.setCyclicBackgroundImages();
      this.startTimer = true;
      this.botStartTime = new Date().getTime()
      this.initialQuestion = this.conversation[0].body;
      this.pushQuestion(this.initialQuestion);
      this.chatService.postChat([...this.conversation], this.botUrl).subscribe({
        next: (event: HttpEvent<string>) => {
          if (event.type === HttpEventType.DownloadProgress) {
            this.handleBotResponse(
              (event as HttpDownloadProgressEvent).partialText + "…",
            );
          } else if (event.type === HttpEventType.Response) {
            this.handleBotResponse(event.body!);
          }
        },
        error: () => {
          console.log("Error getting stream events");
        },
      });
    }
  }

  pushQuestion(question: string, id?: any) {
    this.questionArray.push({ question, id });
  }

  assignId(id: any) {
    for (let i = 0; i < this.questionArray.length; i++) {
      if (!this.questionArray[i].id) {
        this.questionArray[i].id = id;
        break;
      }
    };
  }

  getQuestion(id: any) {
    const questionObj = this.questionArray.find(x => x.id === id);
    return questionObj?.question || '';
  }

  async submitMessage(event: any) {
    logEvent(
      this.analytics, "/chat_preview/chat",
      {
        ...this.getAgentConfigurationDefinitions()
      },
    );
    this.outOfContextAnswerResponseObject = {
      like: false,
      dislike: false
    };
    this.removeSuggestionElement();
    this.pushQuestion(this.chatQuery);

    this.botStartTime = new Date().getTime();
    // keeps the scrollbar to the bottom
    const parentElement = document.getElementsByClassName('chat-body');
    parentElement[0].scrollTo(0, parentElement[0].scrollHeight);

    if (event instanceof KeyboardEvent || event instanceof MouseEvent) {
      event.preventDefault();
    }
    if (!this.chatQuery || this.chatQuery === '') {
      return;
    }
    if (!this.initialQuestion) this.initialQuestion = this.chatQuery;

    let singleMessage: Message = {
      body: this.chatQuery,
      type: 'user',
      shareable: true,
    }

    this.conversation.unshift(singleMessage);
    this.chatQuery = '';
    this.isSendIconDisabled = true;
    this.showLoader = true;
    this.setTimeoutForLoaderText();
    this.setCyclicBackgroundImages();
    this.conversation.unshift({ body: $localize`Thinking...`, type: 'bot', shareable: false });
    this.chatService.postChat([...this.conversation], this.botUrl).subscribe({
      next: (event: HttpEvent<string>) => {
        if (event.type === HttpEventType.DownloadProgress) {
          this.handleBotResponse(
            (event as HttpDownloadProgressEvent).partialText as string
          );
        } else if (event.type === HttpEventType.Response) {
          this.handleBotResponse(event.body as string);
        }
      },
      error: () => {
        console.log("Error getting stream events");
      },
    });
  }

  setErrorMessage() {
    this.clearTimeoutForLoaderText();
    this.leftContainerClass = 'left-side-container-error';
    this.loaderText = $localize`Oops something went wrong , please try again.`;
    this.rightContainerClass = 'right-side-container-error';
    this.showLoaderLikeDislikeButtons = false;
  }

  setAnswerNotFoundText(loaderText: string) {
    this.clearTimeoutForLoaderText();
    this.showLoader = true;
    this.leftContainerClass = 'answer-not-found';
    this.rightContainerClass = 'right-side-container-error';
    this.loaderText = loaderText + $localize` Please try asking something else`;
    this.showLoaderLikeDislikeButtons = true;
  }

  stopTicketCreationFlow() {
    this.isChatDisabled = false;
    this.chatQuery = '';
  }

  setCyclicBackgroundImages() {
    if (this.loaderTextIndex == 3) {
      this.loaderTextIndex = 0;
    }
    this.leftContainerClass = 'left-side-container-' + (this.loaderTextIndex + 1);
    this.rightContainerClass = 'right-side-container-' + (this.loaderTextIndex + 1);
    this.loaderTextIndex++;
  }

  setTimeoutForLoaderText() {
    this.loaderText = this.loaderTextArray[Math.round(Math.random() * 10)];
    this.showLoaderLikeDislikeButtons = false;
    this.loaderTextTimeout = setInterval(() => { this.setCyclicLoaderText(); }, 3000);
  }

  clearTimeoutForLoaderText() {
    clearTimeout(this.loaderTextTimeout);
  }

  setCyclicLoaderText() {
    this.loaderText = this.loaderTextArray[Math.round(Math.random() * 10)];
    this.loaderIndex++;
  }

  handleBotResponse(answer: string) {
    let events: string[] = answer.split("\n");

    // Filter out empty strings that might result from extra newlines.
    events = events.filter(event => event.trim() !== "");

    if (events.length === 0) {
        return;
    }
    
    try {
        let parsedEvent = JSON.parse(events[0]);
        let answerId = parsedEvent.agent.messages[0].kwargs.id; // Access the "id" from the kwargs

        if (answerId === this.conversation[0].chat_id) {
            // Process the *last* event.  Use .at(-1) for clarity and safety.
            const lastEventString = events.at(-1);
            if (!lastEventString) {
                console.warn("No last event found after splitting.");
                return; // Or handle the error appropriately
            }

            const lastEventParsed = JSON.parse(lastEventString);
            const lastMessage = lastEventParsed.agent.messages.at(-1);

            if (lastMessage && lastMessage.kwargs.type === "ai") {
                this.conversation[0].botAnswer += this.removeUnpairedTripleBackticks(lastMessage.kwargs.content);
            }
            return;
        }

        let response: Chat = {
          id: answerId,
          question: this.chatQuery,
          answer: "",
          suggested_questions: []
        }
        
        let endTime = new Date().getTime();
        this.assignId(response?.id);
    
        let singleMesage: Message = {
          body: "",
          botAnswer: response.answer,
          type: 'bot',
          responseTime: ((endTime - this.botStartTime) / 1000).toString(),
          shareable: true,
          botStartTime: this.botStartTime.toString(),
          extras: {
            like: false,
            dislike: false,
            delete: false,
          },
          chat_id: response.id!
        };
    
        this.conversation.unshift(singleMesage);
        if (this.conversation.length > 1 && this.conversation[1].body === $localize`Thinking...` && this.conversation[1].type === 'bot') {
          this.conversation.splice(1, 1);
        }
        this.setSuggestedQuestionInChat(response, endTime);
        this.showLoader = false;
        this.clearTimeoutForLoaderText();
        this.isSuggestedQuestion = '';
        this.textarea.nativeElement.focus();

    } catch (error) {
        console.error("Error parsing JSON:", error);
        console.error("Problematic event data:", answer); // Log the raw event data
        // Consider adding error handling here, such as retrying or logging.
    }
  }

  // adds Suggested question as another message
  setSuggestedQuestionInChat(response: Chat, endTime: number) {
    if (response.suggested_questions?.length || 0 > 0) {
      this.showSuggesstion = true;
      this.suggestedQuestionMessage = {
        body: "",
        type: 'bot',
        responseTime: ((endTime - this.botStartTime) / 1000).toString(),
        shareable: true,
        extras: {
          like: false,
          dislike: false
        },
        suggestedQuestion: response.suggested_questions
      }
      setTimeout(() => {
        const botResponseElement = document.getElementById(this.botStartTime.toString());
        const parentElement = document.getElementsByClassName('chat-body');
        const y = botResponseElement?.offsetTop;
        if (y) {
          parentElement[0].scroll({
            top: y - 30,
            behavior: 'smooth'
          })
        }
      }, 1000);
    }
  }

  chipControlOnSelect(event: any) {
    this.chatQuery = event.target.innerText;
    this.submitMessage(event);
  }

  getResponseforSuggestionQuery(event: any) {
    this.isSuggestedQuestion = event;
    this.chatQuery = event;
    document.querySelectorAll(".bot-suggestion-container").forEach(el => el.remove());
    this.submitMessage(event);
  }

  removeSuggestionElement() {
    this.showSuggesstion = false;
    document.querySelectorAll(".bot-suggestion-container").forEach(el => el.remove());
  }

  startRecording() {
    this.isRecording = true;
    this.audioChunks = [];
    this.mediaRecorder.start();
  }

  stopRecording() {
    this.isRecording = false;
    this.mediaRecorder.stop();
  }

  ngOnInit(): void {
    this.getJsonData();
  }

  onChatQueryInput() {
    this.isSendIconDisabled = !this.chatQuery;
  }

  goToExport() {
    this.router.navigate(['/export']);
  }

  openHelpModal() {
    logEvent(this.analytics, `/how_it_works`, {page: "chat_preview"});
    this.dialog.open(HowItWorksDialogComponent,{ width: '100%',maxWidth:'1200px', data: { url: './assets/images/agent_properties_diagram.png', content: $localize`You can now interact with your deployed AI Agent! On your screen is a description of your selected technologies for your deployed agent, as well as a list of sample prompts to ask. Embedded within this UI is the frontend chatbot code that is interacting with your backend AI agent service.` }, });
  }

  goToHome() {
    logEvent(this.analytics, "/return_to_home", {page: "chat_preview"});
    this.router.navigate(['/']);
  }

  getJsonData() {
    this.httpClient.get<any>('assets/bots-mapping.json').subscribe(
      (data) => {
        this.botsMappingData = data;
        console.log(this.botsMappingData);
        this.botsMappingData.forEach((item: { AGENT_INDUSTRY_TYPE: any; AGENT_ORCHESTRATION_FRAMEWORK: any; AGENT_FOUNDATION_MODEL: any; RUNTIME_ENV_SELECTION: any; }) => {
          const key = `${item.AGENT_INDUSTRY_TYPE}-${item.AGENT_ORCHESTRATION_FRAMEWORK}-${item.AGENT_FOUNDATION_MODEL}-${item.RUNTIME_ENV_SELECTION}`;
          this.botsMap.set(key, item);
        });

        let agentData = JSON.parse(localStorage.getItem('agentData') || '{}');
        this.selectedAgentData = {
          agentName: agentData[1].agentName ? agentData[1].agentName : '-',
          industry: agentData[0].industry ? agentData[0].industry : '-',
          runTime: agentData[2].runTime ? agentData[2].runTime : '',
          frameWork: agentData[3].framework ? agentData[3].framework : '-',
          model: agentData[4].model ? agentData[4].model : '-',
        }

        console.log(agentData);

        const runtime = this.selectedAgentData.runTime;
        const framework = this.selectedAgentData.frameWork;
        const model = this.selectedAgentData.model;
        const industry = this.selectedAgentData.industry;

        this.getBotUrl(industry, framework, model, runtime);

        // this.subtitle = "Use Case: \nAI-Powered Investment Research Analyst for Alphabet: Provides financial insights on Alphabet by analyzing its financial reports, strategic initiatives, and management perspectives from its historical investor documents.";
        // this.question1 = "How did Alphabet perform in their earnings reports in Q4 2024?";
        if(industry === 'finance'){
          this.subtitle = $localize`Use Case - AI-Powered Investment Research Analyst for Alphabet: Provides financial insights on Alphabet by analyzing its financial reports, strategic initiatives, and management perspectives from its historical investor documents.`;
          this.question1 = $localize`1. How did Alphabet perform in their earnings reports in Q4 2024?`;
          this.question2 = $localize`2. What were Alphabet’s key strategic priorities for the 2024?`;
          this.question3 = $localize`3. How does each Alphabet business segment contribute to overall revenue and profit?`;
        } else if(industry === 'healthcare') {
          this.subtitle = $localize`Use Case - Symptom Checker and Triage Assistant: \nAnalyzes general medical symptoms and acts as a virtual assistant to help triage patients to the appropriate level of care during consultations.`;
          this.question1 = $localize`1. What could be causing lower back pain that radiates down my leg?`;
          this.question2 = $localize`2. What red flag symptoms would indicate that my sore throat is something more serious than a cold?`;
          this.question3 = $localize`3. Based on past consultations, are there specific symptoms that were particularly helpful in narrowing down a differential diagnosis?`;
        } else if(industry === 'retail'){
          this.subtitle = $localize`Use Case - Google Product Discovery Assistant: \nAnswers product-specific questions on Google Products available on the Google Store`;
          this.question1 = $localize`1. What are the specs for the Pixel 6 camera?`;
          this.question2 = $localize`2. What is the water resistance rating of the Pixel?`;
          this.question3 = $localize`3. What kind of screen does the Google Nest Hub have?`;
        }
        this.subtitle
      },
      (error) => {
        console.error('Error reading JSON file:', error);
      }
    );
  }

  getBotUrl(industry: string, framework: string, model: string, runtime: string) {
    const key = `${industry}-${framework}-${model}-${runtime}`;
    const bot_config = this.botsMap.get(key);
    console.log(bot_config.CLOUD_RUN_URL);
    console.log(key);
    console.log(this.botsMap);
    this.botUrl = bot_config.CLOUD_RUN_URL + "/streamQuery";
    this.isGeneric = industry === "generic";
    this.safeBotUrl = this.sanitizer.bypassSecurityTrustResourceUrl(bot_config.CLOUD_RUN_URL);
  }

  removeUnpairedTripleBackticks(text: string): string {
    const matches: RegExpMatchArray[] = Array.from(text.matchAll(/```/g));
    // If there are an odd number of triple backtick occurrences, remove the last one
    if (matches.length % 2 !== 0) {
      if (matches.length > 0) { // Check if there are any matches before trying to remove
        const start_index: number = matches[matches.length - 1].index!; // Non-null assertion because we know it exists
        text = text.substring(0, start_index) + text.substring(start_index + 3);
      }
    }
    return text;
  }

  getAgentConfigurationDefinitions() {
    return {
      runtime: this.agentConfiguration.runTime.toLowerCase().replaceAll(" ", "_"),
      orchestration_framework: this.agentConfiguration.framework.toLowerCase(),
      industry: this.agentConfiguration.industry.toLowerCase(),
      model: this.agentConfiguration.model.toLowerCase().replaceAll(" ", "_").replaceAll("_(model_garden)", ""),
    }
  }
}

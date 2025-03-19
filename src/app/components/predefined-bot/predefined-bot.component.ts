import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HowItWorksDialogComponent } from '../how-it-works-dialog/how-it-works-dialog.component';

@Component({
  selector: 'app-predefined-bot',
  templateUrl: './predefined-bot.component.html',
  styleUrl: './predefined-bot.component.scss'
})
export class PredefinedBotComponent {
  formGroup: FormGroup;
  selectedAgent: string = '';
  selectedFramework: string = '';
  selectedTools: string = '';
  selectedModel: string = '';

  constructor(private _formBuilder: FormBuilder, private router: Router, private readonly dialog: MatDialog,) { }

  get formArray(): AbstractControl | null { return this.formGroup.get('formArray'); }


  ngOnInit() {
    this.formGroup = this._formBuilder.group({
      formArray: this._formBuilder.array([
        this._formBuilder.group({
          agentName: ['', Validators.required],
          agentType: ['', Validators.required],
          industry: ['', Validators.required],
        }),
        this._formBuilder.group({
          runTime: ['', Validators.required]
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

  selectAgent(value: string) {
    console.log(value);
    this.selectedAgent = value;
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

  openHelpModal() {
    this.dialog.open(HowItWorksDialogComponent, { width: '100%', maxWidth: '1000px' });
  }

  goToBuild() {
    let agentData: any = [];
    let agentName = "";
    let runTime = "";
    let framework = "";
    let model = "";
    let tools = "";

    if(this.selectedAgent === "intelligentVirtualAssistant") {
      agentName = "Intelligent Virtual Assistant";
      runTime = "Vertex AI Agent Engine";
      framework = "Langchain/Langgraph";
      model = "Gemini";
      tools = "API"
    } else if(this.selectedAgent === "infoBot"){
      agentName = "Info Bot";
      runTime = "Cloud Run";
      framework = "LlamaIndex";
      tools = "Pre-build Tool";
      model = "Claude (Model Garden)"
    }
    agentData.push({agentName});
    agentData.push({runTime});
    agentData.push({framework});
    agentData.push({tools});
    agentData.push({model});

    localStorage.setItem("agentData", JSON.stringify(agentData));
    this.router.navigate(['/spinner']);
  }
}

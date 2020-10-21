import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Feedback, ContactType } from "../shared/feedback";
import { FeedbackService } from "../services/feedback.service";
import { expand, flyInOut } from "../animations/app.animation";
@Component({
  selector: "app-contact",
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.scss"],
  host: {
    "[@flyInOut]": "true",
    style: "display: block;",
  },
  animations: [flyInOut(), expand()],
})
export class ContactComponent implements OnInit {
  feedbackForm: FormGroup;
  feedback: Feedback;
  feedbackcopy: Feedback;
  contactType = ContactType;
  errMess: string;
  ShowingResponse: boolean;
  Loading: boolean;
  @ViewChild("fform") feedbackFormDirective;

  formErrors = {
    firstname: "",
    lastname: "",
    telnum: "",
    email: "",
  };

  validationMessages = {
    firstname: {
      required: "First Name is required.",
      minlength: "First Name must be atleast 2 characters long.",
      maxlength: "First Name cannot be more than 25 characters.",
    },
    lastname: {
      required: "Last Name is required.",
      minlength: "Last Name must be atleast 2 characters long.",
      maxlength: "Last Name cannot be more than 25 characters.",
    },
    telnum: {
      required: "Tel. Num is required.",
      pattern: "Tel. Num must contain only numbers.",
    },
    email: {
      required: "email is required.",
      email: "Email not in valid format.",
    },
  };

  onValueChanged(data?: any) {
    if (!this.feedbackForm) {
      return;
    }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error messages if any
        this.formErrors[field] = "";
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + " ";
            }
          }
        }
      }
    }
  }
  constructor(
    private fb: FormBuilder,
    private feedbackservice: FeedbackService,
    @Inject("BaseURL") private BaseURL
  ) {
    this.createForm();
    // this.Loading = false;
    // this.ShowingResponse = false;
  }

  ngOnInit() {}

  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(25),
        ],
      ],
      lastname: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(25),
        ],
      ],
      telnum: [0, [Validators.required, Validators.pattern]],
      email: ["", [Validators.required, Validators.email]],
      agree: false,
      contacttype: "None",
      message: "",
    });
    this.feedbackForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );
    this.onValueChanged(); // (re)set form validation messages
  }

  onSubmit() {
    this.feedback = this.feedbackForm.value;
    this.feedbackcopy = this.feedbackForm.value;
    this.Loading = true;
    this.feedbackservice.submitFeedback(this.feedbackcopy).subscribe(
      (feedback) => {
        this.feedback = feedback;
        this.feedbackcopy = feedback;
      },
      (errmess) => {
        this.feedback = null;
        this.feedbackcopy = null;
        this.errMess = <any>errmess;
      },
      () => {
        this.ShowingResponse = true;
        setTimeout(() => {
          this.ShowingResponse = false;
          this.Loading = false;
        }, 5000);
      }
    );
    this.feedbackForm.reset({
      firstname: "",
      lastname: "",
      telnum: 0,
      email: "",
      agree: false,
      contacttype: "None",
      message: "",
    });
    this.feedbackFormDirective.resetForm();
  }
}

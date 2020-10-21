import { Component, Input, OnInit, ViewChild, Inject } from "@angular/core";
import { Params, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { Dish } from "../shared/dish";
import { DishService } from "../services/dish.service";
import { switchMap } from "rxjs/operators";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ContactType, Feedback } from "../shared/feedback";
import { Comment } from "../shared/comment";

@Component({
  selector: "app-dishdetail",
  templateUrl: "./dishdetail.component.html",
  styleUrls: ["./dishdetail.component.scss"],
})
export class DishdetailComponent implements OnInit {
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  feedbackForm: FormGroup;
  feedback: Feedback;
  rating = 1;
  @ViewChild("fform") feedbackFormDirective;

  formErrors = {
    firstname: "",
    lastname: "",
    telnum: "",
    email: "",
  };

  validationMessages = {
    firstname: {
      required: "First name is required",
      minlength: "First name must be at least 2 characters long",
      maxlength: "First name cannot be more than 25 characters",
    },
    lastname: {
      required: "First name is required",
      minlength: "First name must be at least 2 characters long",
      maxlength: "First name cannot be more than 25 characters",
    },
    telnum: {
      required: "Telephone number is required",
      pattern: "Telehone number must contain only numbers",
    },
    email: {
      required: "Email number is required",
      email: "Email is not in valid format",
    },
  };

  constructor(
    private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject("baseURL") private baseURL
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.dishService
      .getDishIds()
      .subscribe((dishIds) => (this.dishIds = dishIds));
    this.route.params
      .pipe(
        switchMap((params: Params) => this.dishService.getDish(params["id"]))
      )
      .subscribe((dish) => {
        this.dish = dish;
        this.setPrevNext(dish.id);
      });
  }

  setPrevNext(dishId: string): void {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[
      (this.dishIds.length + index - 1) % this.dishIds.length
    ];
    this.next = this.dishIds[
      (this.dishIds.length + index + 1) % this.dishIds.length
    ];
  }

  goBack(): void {
    this.location.back();
  }

  createForm(): void {
    this.feedbackForm = this.fb.group({
      firstname: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(25),
        ],
      ],
      message: "",
      rating: 0,
    });
  }

  onSubmit(): void {
    this.feedback = this.feedbackForm.value;
    console.log(this.feedback);
    const comment: Comment = {
      rating: this.feedback.rating,
      comment: this.feedback.message,
      author: this.feedback.firstname,
      date: "Dec 3, 2011",
    };
    this.dish.comments.push(comment);
    this.feedbackForm.reset({
      firstname: "",
      contacttype: "",
      message: "",
      agree: false,
    });
    // this.feedbackFormDirective.resetForm(); - not needed???
  }
}

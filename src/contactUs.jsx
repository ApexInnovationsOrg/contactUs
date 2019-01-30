"use strict";

// import React from "react";
// import ReactDOM from "react-dom";
import Button from "react-bootstrap/Button";
import MaskedInput from "react-maskedinput";
import { validate as validateEmail } from "email-validator";
import moment from "moment-timezone/builds/moment-timezone-with-data-2012-2022.min";
import "font-awesome/css/font-awesome.css";
import FontAwesomeIcon from "react-fontawesome";
import decode from "unescape";
// import { hasFlashPlayerVersion } from "swfobject";

import "./styles.scss";

class ContactUs extends React.Component {
	constructor(props) {
		super(props);

		let component = this;

		this.problemCategories = [
			{
				key: "courses",
				title: "A Course",
				icon: "archive"
			},
			{
				key: "account",
				title: "My Account",
				icon: "user-circle"
			},
			{
				key: "other",
				title: "Something Else",
				icon: "question-circle"
			}
		];

		this.contactPreferences = [
			{
				key: "phone",
				title: "Phone",
				icon: "phone",
				condition: () => {
					let hoursRightNow = moment()
						.tz("America/Chicago")
						.hours();
					return hoursRightNow < 16 && hoursRightNow > 6;
				},
				control: function(key) {
					return (
						<div
							key={"container_" + key}
							className={component.state.contactPreference === this.key ? "" : "hidden"}
						>
							<label key={"label_" + key}>Please provide a phone number where we can reach you.</label>
							<MaskedInput
								key={"input_" + key}
								mask="(111) 111-1111"
								type="tel"
								pattern="((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}"
								required
								value={component.state.phoneNumber}
								autoFocus
								onChange={() => component.setState({ phoneNumber: event.target.value })}
								placeholder="(555) 555-5555"
							/>
						</div>
					);
				}
			},
			{
				key: "email",
				title: "Email",
				icon: "envelope",
				condition: () => {
					return true;
				},
				control: function(key) {
					return (
						<div
							key={"container_" + key}
							className={component.state.contactPreference === this.key ? "" : "hidden"}
						>
							<label key={"label_" + key}>Please provide a email address where we can reach you.</label>
							<input
								key={"input_" + key}
								type="email"
								placeholder="janedoe@gmail.com"
								required
								value={component.state.emailAddress}
								autoFocus
								onChange={() => component.setState({ emailAddress: event.target.value })}
							/>
						</div>
					);
				}
			}
		];

		this.reset();
		// this.handleChange = this.handleChange.bind(this);
	}

	reset() {
		this.state = {
			notices: [],
			commonQuestions: [],
			firstName: "",
			lastName: "",
			contactPreference: _.find(this.contactPreferences, preference => {
				return preference.condition();
			}).key,
			problemCategory: null,
			canSubmit: false,
			problemOverview: "",
			description: "",
			emailAddress: "",
			phoneNumber: "",
			requestingSupport: false,
			submitting: false,
			submitted: false,
			errors: []
		};

		this.getNotices();
		this.getCommonQuestions();
		this.getCourses();
	}

	getNotices = () => {
		fetch("/admin/techSupport/notices", {
			method: "GET"
		})
			.then(response => {
				return response.json();
			})
			.then(data => {
				this.setState({
					notices: data
				});
			});
	};

	getCommonQuestions = () => {
		fetch("/admin/techSupport/commonQuestions", {
			method: "GET"
		})
			.then(response => {
				return response.json();
			})
			.then(data => {
				this.setState({
					commonQuestions: data
				});
			});
	};

	getCourses = () => {
		fetch("/admin/techSupport/products", {
			method: "GET"
		})
			.then(response => {
				return response.json();
			})
			.then(data => {
				this.setState({
					availableCourses: data
				});
			});
	};

	getClientInfo() {
		// https://stackoverflow.com/a/11219680

		var nVer = navigator.appVersion;
		var nAgt = navigator.userAgent;
		var browserName = navigator.appName;
		var fullVersion = "" + parseFloat(nVer);
		var majorVersion = parseInt(nVer, 10);
		var nameOffset, verOffset, ix;

		// In Opera, the true version is after "Opera" or after "Version"
		if ((verOffset = nAgt.indexOf("Opera")) != -1) {
			browserName = "Opera";
			fullVersion = nAgt.substring(verOffset + 6);
			if ((verOffset = nAgt.indexOf("Version")) != -1) fullVersion = nAgt.substring(verOffset + 8);
		}
		// In MSIE, the true version is after "MSIE" in userAgent
		else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
			browserName = "Microsoft Internet Explorer";
			fullVersion = nAgt.substring(verOffset + 5);
		}
		// In Chrome, the true version is after "Chrome"
		else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
			browserName = "Chrome";
			fullVersion = nAgt.substring(verOffset + 7);
		}
		// In Safari, the true version is after "Safari" or after "Version"
		else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
			browserName = "Safari";
			fullVersion = nAgt.substring(verOffset + 7);
			if ((verOffset = nAgt.indexOf("Version")) != -1) fullVersion = nAgt.substring(verOffset + 8);
		}
		// In Firefox, the true version is after "Firefox"
		else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
			browserName = "Firefox";
			fullVersion = nAgt.substring(verOffset + 8);
		}
		// In most other browsers, "name/version" is at the end of userAgent
		else if ((nameOffset = nAgt.lastIndexOf(" ") + 1) < (verOffset = nAgt.lastIndexOf("/"))) {
			browserName = nAgt.substring(nameOffset, verOffset);
			fullVersion = nAgt.substring(verOffset + 1);
			if (_.toLower(browserName) == _.toUpper(browserName)) {
				browserName = navigator.appName;
			}
		}
		// trim the fullVersion string at semicolon/space if present
		if ((ix = fullVersion.indexOf(";")) != -1) fullVersion = fullVersion.substring(0, ix);
		if ((ix = fullVersion.indexOf(" ")) != -1) fullVersion = fullVersion.substring(0, ix);

		majorVersion = parseInt("" + fullVersion, 10);
		if (isNaN(majorVersion)) {
			fullVersion = "" + parseFloat(nVer);
			majorVersion = parseInt(nVer, 10);
		}

		let clientInfo = {
			browser: browserName,
			majorVersion: majorVersion,
			fullVersion: fullVersion,
			userAgent: navigator.userAgent
		};

		let browserDescription = _.map(clientInfo, (info, key) => {
			switch (key) {
				case "browser":
					return info;
				case "majorVersion":
					return " " + info;
				case "fullVersion":
					return " (" + info + ")";
				default:
					return "";
			}
		}).join("");

		// browserDescription += " Flash " + (hasFlashPlayerVersion("11.0") ? "" : "");

		return browserDescription;
	}

	getContactPreference(key) {
		return _.find(this.contactPreferences, {
			key: key
		});
	}

	readyForProblemCategory() {
		return this.state.firstName && this.state.lastName;
	}

	readyForProblemOverview() {
		return this.readyForProblemCategory() && this.state.problemCategory;
	}

	readyForDescription() {
		return this.readyForProblemOverview() && this.state.problemOverview;
	}

	readyForContactPreference() {
		return this.readyForDescription() && this.state.description;
	}

	readyForSubmit() {
		return (
			this.readyForContactPreference() &&
			this.state.contactPreference &&
			(this.state.phoneNumber || this.state.emailAddress)
		);
	}

	componentDidUpdate(prevProps, prevState) {
		// any type of request requires problem overview and description
		let canSubmit = this.readyForSubmit();

		switch (this.state.contactPreference) {
			case "phone":
			default:
				// can submit phone request if phone number is provided
				canSubmit = canSubmit && /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/.test(this.state.phoneNumber);
				break;

			case "email":
				// can submit email request if email address is provided
				canSubmit = canSubmit && validateEmail(this.state.emailAddress);
				break;
		}

		// only update the can submit if the previous state was disabled
		if (prevState.canSubmit !== canSubmit) {
			this.setState({ canSubmit: canSubmit });
		}
	}

	submitTicket = () => {
		this.setState({
			submitting: true,
			canSubmit: false
		});

		let options = {
			firstName: this.state.firstName,
			lastName: this.state.lastName,
			contactPreference: this.state.contactPreference,
			problemOverview: this.state.problemOverview,
			description: this.state.description,
			browserInfo: this.getClientInfo()
		};

		switch (this.state.contactPreference) {
			case "phone":
			default:
				options.contactInfo = this.state.phoneNumber;
				break;

			case "email":
				options.contactInfo = this.state.emailAddress;
				break;
		}

		fetch("/admin/techSupport/submitTicket", {
			method: "POST",
			body: JSON.stringify(options)
		})
			.then(response => {
				return response.json();
			})
			.then(data => {
				this.setState({
					submitting: false,
					submitted: data.success,
					errors: data.errors
				});

				// auto-closing on successful submission
				if (this.state.submitted) {
					setTimeout(function() {
						clearTimeout(this);

						// component.reset();
					}, 1000);
				}
			});
	};

	submitText() {
		if (this.state.submitting) {
			return "Submitting...";
		}

		if (this.state.submitted) {
			return "Submitted!";
		}

		return "Submit";
	}

	render() {
		let submitVerbiage = this.submitText();

		return (
			<div className="contactUsContainer">
				<div className="modal-header">
					<strong
						style={{
							color: "#D20000"
						}}
					>
						Customer/Technical Support
					</strong>
					<Button className="close" data-dismiss="modal">
						<FontAwesomeIcon name="close" />
					</Button>
				</div>

				<div className="modal-body">
					{/* Notices */}
					{this.state.notices.map((notice, i) => {
						return (
							<div key={"notice_" + i} className="notice">
								<strong className="fullWidth">Support Notice</strong>
								<label className="fullWidth">{notice}</label>
								<a
									onClick={() => {
										this.setState({
											notices: this.state.notices.filter((_value, index) => {
												return index !== i;
											})
										});
									}}
								>
									Close message
								</a>
							</div>
						);
					})}

					{/* Initial View */}
					<div className={this.state.requestingSupport ? "hidden" : ""}>
						{/* Common Questions */}
						<div className="commonQuestions card">
							<strong>Common Questions</strong>
							<ul>
								{this.state.commonQuestions.map((commonQuestion, i) => {
									return (
										<li key={"commonQuestion_item_" + i}>
											<a
												key={"commonQuestion_title" + i}
												onClick={() => {
													this.setState({
														openedCommonQuestion:
															this.state.openedCommonQuestion === i ? null : i
													});
												}}
												dangerouslySetInnerHTML={{ __html: decode(commonQuestion.title) }}
											/>
											<div
												key={"commonQuestion_content_" + i}
												className={this.state.openedCommonQuestion === i ? "" : "hidden"}
												dangerouslySetInnerHTML={{ __html: decode(commonQuestion.content) }}
											/>
										</li>
									);
								})}
							</ul>
						</div>

						<hr />

						<div className="row">
							<label>Still having trouble?</label>
							<Button variant="primary" onClick={() => this.setState({ requestingSupport: true })}>
								<strong>Contact Support</strong>
							</Button>
						</div>
					</div>

					{/* Request Support View */}
					<div className={this.state.requestingSupport ? "" : "hidden"}>
						<div className="row">
							<Button variant="link" onClick={() => this.setState({ requestingSupport: false })}>
								<strong>
									<FontAwesomeIcon name="angle-left" /> Back to help
								</strong>
							</Button>

							<strong
								style={{
									color: "#666666",
									marginLeft: "0.4em"
								}}
							>
								Contacting Support
							</strong>
						</div>

						{/* Post-Submit Display */}
						<div
							className={
								"text-center section collapsible " +
								(this.state.submitting || this.state.submitted || this.state.errors.length > 0
									? ""
									: "collapsed")
							}
						>
							<FontAwesomeIcon
								name={(() => {
									if (this.state.submitting) return "circle-o-notch";
									if (this.state.submitted) return "check-circle";

									return "times-circle";
								})()}
								size="3x"
								spin={this.state.submitting ? "spin" : ""}
								style={{
									color: (() => {
										if (this.state.submitting) return "#cccccc";
										if (this.state.submitted) return "green";

										return "red";
									})()
								}}
							/>

							{this.state.submitting ? <p>Submitting your support request.</p> : ""}
							{this.state.submitted ? <p>Your support request was submitted successfully.</p> : ""}
							<p className="">
								{this.state.errors.length > 0
									? this.state.errors.map((error, i) => {
											return <label key={"error_" + i}>{error}</label>;
									  })
									: ""}
							</p>
						</div>

						{/* Pre-Submit Display */}
						<div
							className={
								"collapsible " +
								(!(this.state.submitting || this.state.submitted || this.state.errors.length > 0)
									? ""
									: "collapsed")
							}
						>
							{/* First and Last Name */}
							<div className="row section">
								<label>First things first: we need to know who you are!</label>
								<input
									type="text"
									autoFocus
									required
									maxLength="25"
									placeholder="First Name"
									// value={this.currentUser.FirstName}
									onChange={() => this.setState({ firstName: event.target.value })}
								/>
								<input
									type="text"
									required
									maxLength="25"
									placeholder="Last Name"
									// value={this.currentUser.LastName}
									onChange={() => this.setState({ lastName: event.target.value })}
								/>
							</div>

							{/* Problem Category Selection */}
							<div
								className={
									"problemCategorySelectionContainer row section collapsible " +
									(this.readyForProblemCategory() ? "" : "collapsed")
								}
							>
								<label>
									Thanks, <span>{this.state.firstName}</span>. What are you having trouble with?
								</label>
								<div className="problemCategorySelection">
									{this.problemCategories.map((category, i) => {
										return (
											<Button
												key={i}
												variant="danger"
												active={this.state.problemCategory === category.key ? "active" : ""}
												onClick={() => this.setState({ problemCategory: category.key })}
											>
												<FontAwesomeIcon key={i} name={category.icon} />
												{category.title}
											</Button>
										);
									})}
								</div>
							</div>

							{/* Problem Overview */}
							<div
								className={
									"row section collapsible " + (this.readyForProblemOverview() ? "" : "collapsed")
								}
							>
								<label>Problem not listed? No problem. Just give us a brief overview.</label>
								<input
									className="fullWidth"
									value={this.state.problemOverview}
									onChange={() => this.setState({ problemOverview: event.target.value })}
									placeholder="Problem overview"
									type="text"
								/>
							</div>

							{/* Description */}
							<div
								className={"row section collapsible " + (this.readyForDescription() ? "" : "collapsed")}
							>
								<label>Describe the problem you're having as best as you can.</label>
								<textarea
									className="fullWidth"
									value={this.state.description}
									onChange={() => this.setState({ description: event.target.value })}
									placeholder="Providing a clear, concise description of the problem you're having helps us to better help you. Be sure to provide any context you think could be relevant. We appreciate you taking the time."
								/>
							</div>

							{/* Contact Preference */}
							<div
								className={
									"row section text-center collapsible " +
									(this.readyForContactPreference() ? "" : "collapsed")
								}
							>
								<hr />
								<label>How would you like to be contacted?</label>

								{!this.getContactPreference("phone").condition() ? (
									<span className="tiny" style={{ color: "red" }}>
										It is currently after hours. You may request a phone call between 4pm and 7am.
									</span>
								) : (
									""
								)}

								{/* Buttons */}
								<div className="row section">
									{this.contactPreferences.map((preference, key) => {
										return (
											<FontAwesomeIcon
												key={"icon_" + key}
												name={preference.icon}
												className={
													"contactSelection " +
													(this.state.contactPreference === preference.key
														? "selected"
														: "") +
													" " +
													(!preference.condition() ? "disabled" : "")
												}
												onClick={() => {
													if (!preference.condition()) return;

													this.setState({
														contactPreference: preference.key
													});
												}}
											/>
										);
									})}
								</div>

								{/* Controls */}
								<div className="row section">
									{this.contactPreferences.map((preference, i) => {
										if (!preference.condition()) return;

										return preference.control(i);
									})}
								</div>
							</div>

							{/* Submit or Cancel */}
							<div
								className={
									"row section collapsible flexed " + (this.readyForSubmit() ? "" : "collapsed")
								}
							>
								<span className="tiny secondary-text">All inputs are required.</span>
								<div>
									<Button variant="outline-danger">Cancel</Button>
									<Button
										className={"btn " + (this.state.submitting ? "" : "btn-success")}
										disabled={!this.state.canSubmit ? "disabled" : ""}
										onClick={this.submitTicket}
									>
										{submitVerbiage}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

ReactDOM.render(<ContactUs />, document.getElementById("innerModal"));

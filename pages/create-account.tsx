import { useState } from "react";

import AuthWrapper from "@/components/AuthWrapper";
import Layout from "@/components/Layout";

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const defaultValue = {
  caretakerFullname: "",
  emailAddress: "",
  phoneNumber: "",
  seniorFullName: "",
  gender: "",
  consent: false,
};

const CreateAccount = () => {
  const [value, setValue] = useState(defaultValue);
  const [errors, setErrors] = useState({
    caretakerFullname: "",
    emailAddress: "",
    phoneNumber: "",
    seniorFullName: "",
    consent: "",
  });

  // Validate phone number
  const validatePhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) {
      return "Phone number is required";
    } else if (!isValidPhoneNumber(phoneNumber)) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    } else if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  // Validate caretaker fullname
  const validateCaretakerFullname = (fullname: string) => {
    if (!fullname) {
      return "Please enter caretaker's fullname";
    }
    return "";
  };

  // Validate senior fullname
  const validateSeniorFullname = (fullname: string) => {
    if (!fullname) {
      return "Please enter senior citizen's fullname";
    }
    return "";
  };

  // Validate consent
  const validateConsent = (consent: boolean) => {
    if (!consent) {
      return "Please check to consent";
    }
    return "";
  };

  // Handle input change and validation
  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Update the value state
    setValue((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Validate the field
    let errorMessage = "";

    switch (name) {
      case "caretakerFullname":
        errorMessage = validateCaretakerFullname(value);
        break;
      case "emailAddress":
        errorMessage = validateEmail(value);
        break;
      case "seniorFullName":
        errorMessage = validateSeniorFullname(value);
        break;
      case "gender":
        errorMessage = "";
        break;
      default:
        break;
    }

    // Update the error state
    setErrors((prevState) => ({
      ...prevState,
      [name]: errorMessage,
    }));
  };

  // Handle phone number change and validation
  const handlePhoneChange = (value: any) => {
    console.log(value);
    setValue((prevState) => ({
      ...prevState,
      phoneNumber: value || "",
    }));

    // Validate phone number
    const phoneError = validatePhoneNumber(value);
    setErrors((prevState) => ({
      ...prevState,
      phoneNumber: phoneError,
    }));
  };

  // Handle consent change and validation
  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const consentValue = e.target.checked;
    setValue((prevState) => ({
      ...prevState,
      consent: consentValue,
    }));

    // Validate consent
    const consentError = validateConsent(consentValue);
    setErrors((prevState) => ({
      ...prevState,
      consent: consentError,
    }));
  };

  // Validate form on submit
  const validateForm = () => {
    let isValid = true;

    // Validate caretaker's fullname
    const caretakerFullnameError = validateCaretakerFullname(
      value.caretakerFullname
    );
    if (caretakerFullnameError) {
      setErrors((prevState) => ({
        ...prevState,
        caretakerFullname: caretakerFullnameError,
      }));
      isValid = false;
    }

    // Validate email address
    const emailAddressError = validateEmail(value.emailAddress);
    if (emailAddressError) {
      setErrors((prevState) => ({
        ...prevState,
        emailAddress: emailAddressError,
      }));
      isValid = false;
    }

    // Validate senior fullname
    const seniorFullNameError = validateSeniorFullname(value.seniorFullName);
    if (seniorFullNameError) {
      setErrors((prevState) => ({
        ...prevState,
        seniorFullName: seniorFullNameError,
      }));
      isValid = false;
    }

    // Validate consent checkbox
    const consentError = validateConsent(value.consent);
    if (consentError) {
      setErrors((prevState) => ({
        ...prevState,
        consent: consentError,
      }));
      isValid = false;
    }

    // Return the final validity state
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state before validation
    setErrors({
      caretakerFullname: "",
      emailAddress: "",
      phoneNumber: "",
      seniorFullName: "",
      consent: "",
    });

    // Validate the form
    const isValid = validateForm();

    // If the form is valid, submit it; otherwise, don't submit
    if (isValid) {
      console.log("Form submitted successfully!");
      setValue(defaultValue); // Optionally, clear the form fields
    } else {
      console.log("Form has errors. Please fix them before submitting.");
    }
  };

  return (
    <AuthWrapper>
      <Layout>
        <h1 className="text-center text-2xl font-semibold">
          Let's get to know you
        </h1>

        <div className="pt-24">
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="form-field pb-5">
              <label className="block pb-2">
                Caretaker's Fullname <span className="text-rose-500">*</span>
              </label>
              <input
                className="border border-slate-200 rounded-full h-12 px-5 w-full"
                type="text"
                value={value.caretakerFullname}
                name="caretakerFullname"
                onChange={handleOnChange}
              />
              {errors.caretakerFullname && (
                <p className="text-rose-500 text-base pt-2">
                  {errors.caretakerFullname}
                </p>
              )}
            </div>

            <div className="form-field pb-5">
              <label className="block pb-2">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                className="border border-slate-200 rounded-full h-12 px-5 w-full"
                type="email"
                value={value.emailAddress}
                name="emailAddress"
                onChange={handleOnChange}
              />
              {errors.emailAddress && (
                <p className="text-rose-500 text-base pt-2">
                  {errors.emailAddress}
                </p>
              )}
            </div>

            <div className="form-field pb-5">
              <label className="block pb-2">Phone Number</label>
              <PhoneInput
                placeholder="Enter phone number"
                value={value.phoneNumber}
                onChange={handlePhoneChange}
                className="border border-slate-200 rounded-full h-12 px-5 w-full"
              />
              {errors.phoneNumber && (
                <p className="text-rose-500 text-base pt-2">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div className="form-field pb-5">
              <label className="block pb-2">
                Senior Citizen's Fullname{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                className="border border-slate-200 rounded-full h-12 px-5 w-full"
                type="text"
                value={value.seniorFullName}
                name="seniorFullName"
                onChange={handleOnChange}
              />
              {errors.seniorFullName && (
                <p className="text-rose-500 text-base pt-2">
                  {errors.seniorFullName}
                </p>
              )}
            </div>

            <div className="form-field pb-5">
              <label className="block pb-2">
                Gender <span className="text-rose-500">*</span>
              </label>
              <div className="border border-slate-200 rounded-full h-12 px-5">
                <select
                  className="w-full h-full"
                  name="gender"
                  value={value.gender}
                  onChange={handleOnChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="form-field pb-5">
              <label className="block font-bold">Consent</label>
              <p className="pt-2">
                Do you consent to the collection and use of your personal data
                in accordance with our privacy policy? Your information will be
                kept confidential and only used for the purposes outlined.
              </p>
              <div className="pt-3">
                <input
                  type="checkbox"
                  name="consent"
                  checked={value.consent}
                  onChange={handleConsentChange}
                />
                <label htmlFor="consent-checkbox" className="inline-block pl-2">
                  Yes, I consent
                </label>
              </div>
              {errors.consent && (
                <p className="text-rose-500 text-base pt-2">{errors.consent}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="font-semibold w-52 flex items-center justify-center h-11 mx-auto mt-10 bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-secondary hover:to-primary px-5 rounded-full"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </AuthWrapper>
  );
};

export default CreateAccount;

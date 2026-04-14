import React, { useState } from "react";
import {
  Button,
  Dialog,
  Card,
  CardBody,
  CardFooter,
  Typography,
  Input,
  IconButton
} from "@material-tailwind/react";
import { updateClient } from "@/services/clientservices";
import { confirmation } from "@/widgets/alert_confirmation";
export function Dialogupdate(props) {
  const [formData, setFormData] = useState({
    raison_sociale: props.client.raison_sociale || "",
    responsable: props.client.responsable || "",
    email: props.client.email || "",
    adresse: props.client.adresse || "",
    telephone: props.client.telephone || "",
  });
  const [errors, setErrors] = useState({
    raison_sociale: "",
    responsable: "",
    email: "",
    adresse: "",
    telephone: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.raison_sociale) {
      newErrors.raison_sociale = "Raison Sociale is required";
      isValid = false;
    }

    if (!formData.responsable) {
      newErrors.responsable = "Responsable is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.adresse) {
      newErrors.adresse = "Adresse is required";
      isValid = false;
    }

    if (!formData.telephone) {
      newErrors.telephone = "Telephone is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      let confirmer = await confirmation();
            if (confirmer) {
              try {
                await updateClient(props.client.id,formData);
                props.setReload(formData);
                props.handleOpen();
                console.log("Client added successfully!");
              } catch (error) {
                console.error("Error adding client:", error);
              }
            } else {
              props.handleOpen();
            }
    }
  };

  const isValidEmail = (email) => {
    const re =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <Dialog
      open={props.open}
      handler={props.handleOpen}
      className="bg-transparent shadow-none"
    >
      <Card className="mx-auto ps-10 w-full max-w-[33rem]"> 
        <div className="flex justify-end pe-2 pt-2">
          <IconButton
            size="sm"
            variant="text"
            onClick={props.handleOpen}
            className="bg-dark "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>
        <CardBody className="flex flex-col gap-4 ">
          <Typography variant="h4" color="blue-gray">
            Modifier Client
          </Typography>
          <Typography
            className="mb-3 font-normal"
            variant="paragraph"
            color="gray"
          >
            Modifier les details du client
          </Typography>
          <div className="my-4 flex items-center gap-4">
            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-medium"
              >
                Raison Sociale
              </Typography>
              <Input
                name="raison_sociale"
                label="Raison Sociale"
                size="lg"
                value={formData.raison_sociale}
                onChange={handleChange}
                error={!!errors.raison_sociale}
              />
              {errors.raison_sociale && (
                <Typography variant="paragraph" color="red">
                  {errors.raison_sociale}
                </Typography>
              )}
            </div>
            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-medium"
              >
                Responsable
              </Typography>
              <Input
                name="responsable"
                label="Responsable"
                size="lg"
                value={formData.responsable}
                onChange={handleChange}
                error={!!errors.responsable}
              />
              {errors.responsable && (
                <Typography variant="paragraph" color="red">
                  {errors.responsable}
                </Typography>
              )}
            </div>
          </div>
          <div className="my-4 flex items-center gap-4">
            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-medium"
              >
                Email
              </Typography>
              <Input
                name="email"
                label="Email"
                size="lg"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
              />
              {errors.email && (
                <Typography variant="paragraph" color="red">
                  {errors.email}
                </Typography>
              )}
            </div>
            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-medium"
              >
                Téléphone
              </Typography>
              <Input
                name="telephone"
                label="Téléphone"
                size="lg"
                value={formData.telephone}
                onChange={handleChange}
                error={!!errors.telephone}
              />
              {errors.telephone && (
                <Typography variant="paragraph" color="red">
                  {errors.telephone}
                </Typography>
              )}
            </div>
          </div>
          <Typography className="-mb-2" variant="h6">
            Adresse
          </Typography>
          <Input
            name="adresse"
            label="Adresse"
            size="lg"
            value={formData.adresse}
            onChange={handleChange}
            error={!!errors.adresse}
          />
          {errors.adresse && (
            <Typography variant="paragraph" color="red">
              {errors.adresse}
            </Typography>
          )}
        </CardBody>
        <CardFooter className="pt-0 flex justify-between">
          <Button fullWidth variant="gradient" onClick={props.handleOpen}>
            Cancel
          </Button>
          <div className="w-4"></div> 
          <Button fullWidth variant="gradient" onClick={handleSubmit}>
            Modifier
          </Button>
        </CardFooter>
      </Card>
    </Dialog>
  );
}

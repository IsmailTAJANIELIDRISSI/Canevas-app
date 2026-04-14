import React, { useState, useEffect } from "react";
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
import { confirmation } from "@/widgets/alert_confirmation";
import { updateByCriteriaNgp } from "@/services/ngpservice";
export function Updatemarchandise(props) {
  const [formData, setFormData] = useState({
    designiation: "",
    codeNGP: "",
    TAUX: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (props.project) {
      setFormData({
        designiation: props.project.designationCommerciale || "",
        codeNGP: parseInt(props.project.codeNGP) || 0, // Parse to integer
        TAUX: props.project.TAUX || ""
      });
    }
  }, [props.project]);
  

  const handleChange = (e, name) => {
    const { value } = e.target;
    // Convert codeNGP to integer if it's numeric
    const newValue = name === "codeNGP" ? parseInt(value, 10) : value;
    setFormData({ ...formData, [name]: newValue });
    setErrors({ ...errors, [name]: "" });
  };
  
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
  
    if (!formData.designiation) {
      newErrors.designiation = "Designation is required";
      isValid = false;
    }
  
    if (!formData.codeNGP) {
      newErrors.codeNGP = "Code NGP is required";
      isValid = false;
    } else {
      // Check if codeNGP is numeric and exactly 10 digits
      const codeNGP = formData.codeNGP.toString(); // Ensure it's a string
      if (!/^\d{10}$/.test(codeNGP)) {
        newErrors.codeNGP = "Code NGP must be exactly 10 digits";
        isValid = false;
      }
    }
  
    if (!formData.TAUX) {
      newErrors.TAUX = "TAUX is required";
      isValid = false;
    }
  
    setErrors(newErrors);
    return isValid;
  };
  

  const handleSubmit = async () => {
    if (validateForm()) {
      let confirmed = await confirmation();
      if (confirmed) {
        try {
          console.log(formData);
          await updateByCriteriaNgp(props.project.designationCommerciale,props.project.codeNGP,formData)
            .then(() => {
              swal("Bravo", "Marchandise mise à jour avec succès.", { icon: "success" });
            })
            .catch(() => {
              swal("Erreur", "Une erreur s'est produite lors de la mise à jour du Marchandise.", { icon: "error" });
            });
          props.setReload(formData); // Reload data after successful submission
          props.handleOpen(); // Close the dialog
          console.log("NGP updated successfully!");
        } catch (error) {
          console.error("Error updating NGP:", error);
        }
      } else {
        props.handleOpen(); // Close the dialog if user cancels confirmation
      }
    }
  };

  return (
    <>
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
          <CardBody className="flex flex-col gap-4">
            <Typography variant="h4" color="blue-gray">
              Mettre à jour Marchandise
            </Typography>
            <Typography
              className="mb-3 font-normal"
              variant="paragraph"
              color="gray"
            >
              Modifier les détails du Marchandise
            </Typography>
            <div className="items-center gap-4 pr-5">
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 font-medium"
                >
                  Désignation commerciale
                </Typography>
                <Input
                  name="designiation"
                  label="Designation"
                  size="lg"
                  value={formData.designiation}
                  onChange={(e) => handleChange(e, "designiation")}
                  error={!!errors.designiation}
                />
                {errors.designiation && (
                  <Typography variant="caption" color="red">
                    {errors.designiation}
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
                  Code NGP (à 10 chiffres)
                </Typography>
                <Input
                  name="codeNGP"
                  label="Code NGP"
                  size="lg"
                  value={formData.codeNGP}
                  onChange={(e) => handleChange(e, "codeNGP")}
                  error={!!errors.codeNGP}
                />
                {errors.codeNGP && (
                  <Typography variant="caption" color="red">
                    {errors.codeNGP}
                  </Typography>
                )}
              </div>
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 font-medium"
                >
                  TAUX
                </Typography>
                <Input
                  name="TAUX"
                  label="TAUX"
                  size="lg"
                  value={formData.TAUX}
                  onChange={(e) => handleChange(e, "TAUX")}
                  error={!!errors.TAUX}
                />
                {errors.TAUX && (
                  <Typography variant="caption" color="red">
                    {errors.TAUX}
                  </Typography>
                )}
              </div>
            </div>
          </CardBody>
          <CardFooter className="pt-0 flex justify-between">
            <Button fullWidth variant="gradient" onClick={props.handleOpen}>
              Annuler
            </Button>
            <div className="w-4"></div>
            <Button fullWidth variant="gradient" onClick={handleSubmit}>
              Mettre à jour
            </Button>
          </CardFooter>
        </Card>
      </Dialog>
    </>
  );
}

export default Updatemarchandise;

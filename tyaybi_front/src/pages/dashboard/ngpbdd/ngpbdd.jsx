import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Typography,
  Select,
  Input,
  Option
} from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { confirmation } from "@/widgets/alert_confirmation";
import { getngp, filterngp, deleteByCriteriaNgp ,filterdup,postngp} from "@/services/ngpservice"; // Adjust import path as per your setup
import { Addform } from "./addmarchandise";
import { Updatemarchandise } from "./updatemarchandise";
import * as XLSX from "xlsx";
export function Ngp() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogupOpen, setIsDialogupOpen] = useState(false);
  const [projets, setProjets] = useState([]);
  const [projettoupdate, setProjettoupdate] = useState();
  const [reload, setReload] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const projetsPerPage = 6;

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getngp(); 
        setProjets(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    loadProjects();
  }, [reload]);

  const handleDelete = async (objetdelete) => {
    let confirmer = await confirmation();
    if (confirmer) {
      try {
        await deleteByCriteriaNgp(objetdelete).then(() => {swal("Bravo", "Marchandise supprimer avec succès.", { icon: "success" })} ).catch(() =>  {swal("Erreur", "Une erreur s'est produite lors de suppression du Marchandise.", { icon: "error" })}) ; // Delete project by codeNGP
        setReload(!reload);
      } catch (error) {
        console.log(error);
      }
    }
  };
  const handlefilterduplicate = async () => {
    const data = await filterdup();
    setProjets(data);
  };
  const handleAddmarchandiseClick = () => {
    setIsDialogOpen(true);
  };
  const handlereload = () => {
    setReload(!reload);
  };
  const handleUpdateProjectClick = (project) => {
    setProjettoupdate(project);
    setIsDialogupOpen(true);
  };

  const handleCloseDialogforadd = () => {
    setIsDialogOpen(false);
  };

  const handleCloseDialogforup = () => {
    setIsDialogupOpen(false);
  };

  const indexOfLastProject = currentPage * projetsPerPage;
  const indexOfFirstProject = indexOfLastProject - projetsPerPage;
  const currentProjets = projets.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projets.length / projetsPerPage);

  const next = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = async () => {
    try {
      const filteredData = await filterngp(searchTerm);
      setProjets(filteredData);
      setCurrentPage(1); // Reset to the first page
    } catch (error) {
      console.error("Failed to filter projects:", error);
    }
  };
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('excelFile', file);
  
    try {
      const response = await fetch('http://localhost:3000/uploadJsonData', {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload Excel file');
      }
  
      // Optionally handle success response
      const result = await response.text();
      console.log('Upload success:', result);
      
      // Optionally show a success message
      swal("Bravo", "Marchandises ajoutées avec succès.", { icon: "success" });
      setReload(!reload); // Reload data after successful submission
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      // Optionally show an error message
      swal("Erreur", "Une erreur s'est produite lors du chargement du fichier Excel.", { icon: "error" });
    }
  };
  
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
      <CardHeader
  variant="gradient"
  color="gray"
  className="p-6 flex items-center justify-between"
>
  <Typography variant="h6" color="white">
    Liste des Marchandises
  </Typography>
  
  <div className="flex items-center">
    <div className="ml-3 flex items-center">
      <label
        htmlFor="dropzone-file-exclusion"
        className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        style={{ width: '250px', height: '80px' }} // Adjust width and height as needed
      >
        <div className="flex flex-col items-center justify-center pt-2 pb-2">
          <svg
            className="w-6 h-6 mb-1 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> the excel file
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">XLSX, CSV</p>
        </div>
        <input
          id="dropzone-file-exclusion"
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>
    </div>

    <Button
      className="ml-3 flex items-center gap-1 whitespace-nowrap" // Ensure button takes up all text space in one line
      size="sm"
      onClick={handleAddmarchandiseClick}
    >
      <UserPlusIcon strokeWidth={2} className="h-4 w-4" />
      <span className="truncate">Ajouter Marchandise</span> {/* Truncate long text if needed */}
    </Button>
  </div>
</CardHeader>


        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="flex space-x-4">
            
            <div className="mr-auto md:mr-4 md:w-56" >
              <Input label="Search" size="lg" value={searchTerm} onChange={handleSearchChange} />
            </div>
            
            <Button className="flex items-center gap-3 " variant="outlined" size="sm" onClick={handleSearchClick}>
              Search
            </Button>
            
          <Button
            className="flex items-center gap-3"
            size="sm"
            variant="outlined"
            onClick={handlefilterduplicate}
          >Filtrer par les doublons
          </Button>
          <Button variant="outlined" className="flex items-center gap-3" onClick={handlereload}>
        
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </Button>
          </div>
        </div>
        <CardBody className="overflow-x-scroll px-6 pt-0 pb-6">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Désignation commerciale", "Code NGP(à 10 chiffres)", "TAUX", "Actions"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentProjets.map(({ "Désignation commerciale": designationCommerciale, "Code NGP(à 10 chiffres)": codeNGP, TAUX }) => (
                <tr>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold"
                    >
                      {designationCommerciale}
                    </Typography>
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold"
                    >
                      {codeNGP}
                    </Typography>
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold"
                    >
                      {TAUX}
                    </Typography>
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Button color="red" size="sm" onClick={() => handleDelete({designationCommerciale, codeNGP})}>Supprimer</Button>&nbsp;&nbsp;
                    <Button color="green" size="sm" onClick={() => handleUpdateProjectClick({ designationCommerciale, codeNGP, TAUX })}>Modifier</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
        <div className="flex items-center justify-between px-6 pb-6">
          <Button variant="text" onClick={prev} disabled={currentPage === 1}>
            <ArrowLeftIcon className="h-5 w-5" /> Previous
          </Button>
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="text"
            onClick={next}
            disabled={currentPage === totalPages}
          >
            Next <ArrowRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </Card>
      {isDialogupOpen && (
        <Updatemarchandise
          open={isDialogupOpen}
          project={projettoupdate}
          setReload={setReload}
          handleOpen={handleCloseDialogforup}
        />
      )}
      {isDialogOpen && (
        <Addform
          open={isDialogOpen}
          setReload={setReload}
          handleOpen={handleCloseDialogforadd}
        />
      )}
    </div>
  );
}

export default Ngp;

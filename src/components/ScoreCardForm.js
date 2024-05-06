import React, { useState, useRef } from "react";
import { Form, Button, Table } from "react-bootstrap";
import ResetButton from "./ResetButton";
import "./ScoreCardForm.css";
import GradingScaleTable from "./GradingScaleTable";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ScoreCardForm = ({ onSubmit }) => {
  const formRef = useRef(null); // Ref for the form element

  const FT = 20;
  const Oral = 10;
  const SA = 60;
  const OralSA = 10;
  const Overall = 100;

  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [scholasticData, setScholasticData] = useState({});
  const [attendanceData, setAttendanceData] = useState({
    workingDays: "",
    daysPresent: "",
    percentage: "",
    cgpa: "",
    grade: "",
    teacherRemarks: "",
  });

  const [activities, setActivities] = useState({});

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [isSubjectAdded, setIsSubjectAdded] = useState(false);

  const handleChangeNewSubject = (e) => {
    setNewSubject(e.target.value);
  };

  // const handleAddSubject = () => {
  //   const pattern = /^[a-zA-Z]+$/;
  //   if (pattern.test(newSubject.trim())) {
  //     if (newSubject.trim() !== "") {
  //       setScholasticData({
  //         ...scholasticData,
  //         [newSubject]: { FT: "", Oral: "", SA: "", OralSA: "" },
  //       });
  //       setNewSubject("");
  //       setIsSubjectAdded(true);
  //       console.log("isSubjectAdded:", isSubjectAdded);
  //     }
  //   } else {
  //     alert("Please enter alphabetic characters only for the subject name.");
  //   }
  // };

  const handleAddSubject = () => {
    const pattern = /^[a-zA-Z]+$/;

    if (!pattern.test(newSubject.trim())) {
      alert("Please enter alphabetic characters only for the subject name.");
      return;
    }

    if (newSubject.trim() === "") {
      return;
    }

    setScholasticData({
      ...scholasticData,
      [newSubject]: { FT: "", Oral: "", SA: "", OralSA: "" },
    });
    setNewSubject("");
    setIsSubjectAdded(true);
    console.log("isSubjectAdded:", isSubjectAdded);
  };

  const handleChangeNewActivity = (e) => {
    setNewActivity(e.target.value);
  };

  const handleAddActivity = () => {
    const pattern = /^[a-zA-Z]+$/;
    if (pattern.test(newActivity.trim())) {
      if (newActivity.trim() !== "") {
        setActivities({
          ...activities,
          [newActivity]: { Grade: "" },
        });
        setNewActivity("");
      }
    } else {
      alert("Please enter alphabetic characters only for the activity name.");
    }
  };

  const handleChangeScholastic = (subject, subCategory, e) => {
    const { value } = e.target;
    const numericValue = parseInt(value, 10);
    if (numericValue === 0 && value.length > 1) {
      e.preventDefault();
      e.target.value = ""; // Clear the input field
      return;
    }

    setScholasticData({
      ...scholasticData,
      [subject]: { ...scholasticData[subject], [subCategory]: parseInt(value) },
    });
  };

  const handleChangeActivity = (index, e) => {
    const {} = e.target;
  };

  const handleSubmit = (e) => {
    console.log("handleSubmit called");
    e.preventDefault();

    // Validation for student name and roll number
    if (!studentName.trim() || !rollNumber.trim()) {
      alert("Student name and roll number are required fields.");
      return;
    }

    if (Object.keys(scholasticData).length == 0) {
      alert("Please add at least one subject before submitting.");
      return;
    }

    if (Object.keys(activities).length == 0) {
      alert("Please add at least one activity before submitting.");
      return;
    }
    const scholasticDataWithOverallMarks = { ...scholasticData };
    let grandTotal = 0;
    Object.entries(scholasticDataWithOverallMarks).forEach(
      ([subject, marks]) => {
        if (subject !== "GrandTotal") {
          const overallMarks = marks.FT + marks.Oral + marks.SA + marks.OralSA;
          scholasticDataWithOverallMarks[subject] = { ...marks, overallMarks };
          grandTotal += overallMarks;
        }
      }
    );

    const { workingDays, daysPresent } = attendanceData;
    const percentage = ((daysPresent / workingDays) * 100).toFixed(2);
    const grandTotalPercentage = ((grandTotal / 500) * 100).toFixed(2);

    const cgpa = parseFloat((grandTotalPercentage / 10).toFixed(2));

    setScholasticData({
      ...scholasticDataWithOverallMarks,
      GrandTotal: {
        overallMarks: grandTotal,
        percentageOfGD: grandTotalPercentage,
      },
    });

    let grade, teacherRemarks;
    if (grandTotalPercentage > 90) {
      grade = "A1";
      teacherRemarks = "Excellent";
    } else if (grandTotalPercentage < 91 && grandTotalPercentage > 80) {
      grade = "A2";
      teacherRemarks = "Very Good";
    } else if (grandTotalPercentage < 81 && grandTotalPercentage > 70) {
      grade = "B1";
      teacherRemarks = "Good";
    } else if (grandTotalPercentage < 71 && grandTotalPercentage > 60) {
      grade = "B2";
      teacherRemarks = "Satisfactory";
    } else if (grandTotalPercentage < 61 && grandTotalPercentage > 50) {
      grade = "C1";
      teacherRemarks = "Satisfactory";
    } else if (grandTotalPercentage < 51 && grandTotalPercentage > 40) {
      grade = "C2";
      teacherRemarks = "Unsatisfactory";
    } else {
      grade = "D";
      teacherRemarks = "FAIL";
    }

    setAttendanceData({
      ...attendanceData,
      percentage,
      grade,
      cgpa,
      teacherRemarks,
    });

    onSubmit({
      studentName,
      rollNumber,
      scholasticData: scholasticDataWithOverallMarks,
      attendanceData,
      grandTotalPercentage,
    });
    setShowDownloadButton(true);
    setFormSubmitted(true);
  };

  const handleDownloadPDF = () => {
    const excludedElements = document.querySelectorAll(".exclude-from-pdf");
    excludedElements.forEach((element) => {
      element.style.display = "none";
    });
    if (!formRef.current) return;

    html2canvas(formRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("score_card.pdf");

      handleReset();
    });

    setShowDownloadButton(false);
    setFormSubmitted(false);
  };

  const handleReset = () => {
    setNewSubject("");
    setNewActivity("");
    setStudentName("");
    setRollNumber("");
    setAttendanceData({
      workingDays: "",
      daysPresent: "",
      percentage: "",
      cgpa: "",
      grade: "",
      teacherRemarks: "",
    });
    setScholasticData({});
    setActivities({});
    setShowDownloadButton(false);
    setFormSubmitted(false);
  };

  return (
    <>
      <Form ref={formRef} onSubmit={handleSubmit} className="score-card-form">
        <h1>FIRST TERMINAL EXAMINATION 2024-25</h1>
        <h2>ACADEMIC PERFORMANCE</h2>

        {/* Student Name and Roll Number Fields */}
        <Form.Group controlId="studentName">
          <Form.Label className="bold-label">Student Name</Form.Label>
          &nbsp;
          <Form.Control
            className="custom-input" // Add a class name to target the input fields
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Please Enter The Student Name"
            pattern="[A-Za-z ]+"
            title="Please Enter Alphabetic Characters Only"
            required
            disabled={formSubmitted}
          />
        </Form.Group>

        <Form.Group controlId="rollNumber">
          <Form.Label className="bold-label">Roll Number</Form.Label>&nbsp;
          <Form.Control
            className="custom-input" // Add the same class name to target the input fields
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="Please Enter The Roll Number"
            pattern="[0-9]+"
            title="Please Enter Numeric Characters Only"
            required
            disabled={formSubmitted}
          />
        </Form.Group>

        <div style={{ display: formSubmitted ? "none" : "block" }}>
          <Button onClick={handleAddSubject} disabled={formSubmitted}>
            Add Subject
          </Button>
          &nbsp;
          {formSubmitted ? null : (
            <Form.Control
              // className="SubjectBTN"
              type="text"
              value={newSubject}
              onChange={handleChangeNewSubject}
              placeholder="Please Enter The Subject Name"
              title="Please Enter Alphabetic Characters Only"
              style={{ width: "300px" }} // Adjust the width as needed
            />
          )}
        </div>
        <div style={{ display: formSubmitted ? "none" : "block" }}>
          <Button onClick={handleAddActivity} disabled={formSubmitted}>
            Add Activity
          </Button>
          &nbsp;
          {formSubmitted ? null : (
            <Form.Control
              // className="ActivityBTN"
              type="text"
              value={newActivity}
              onChange={handleChangeNewActivity}
              placeholder="Please Enter The Activity Name"
              title="Please Enter Alphabetic Characters Only"
              style={{ width: "300px" }}
            />
          )}
        </div>
        <div className="scholastic-area">
          <h3>Part - 1 : Scholastic Area</h3>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>FT-{FT}</th>
                <th>Oral-{Oral}</th>
                <th>SA-{SA}</th>
                <th>OralSA-{OralSA}</th>
                <th>Overall Marks-{Overall}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scholasticData).map(([subject, marks]) => {
                if (subject !== "GrandTotal") {
                  return (
                    <tr key={subject}>
                      <td>{subject}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={marks.FT}
                          onChange={(e) =>
                            handleChangeScholastic(subject, "FT", e)
                          }
                          min={0}
                          max={20}
                          required
                          disabled={formSubmitted}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={marks.Oral}
                          onChange={(e) =>
                            handleChangeScholastic(subject, "Oral", e)
                          }
                          min={0}
                          max={10}
                          required
                          disabled={formSubmitted}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={marks.SA}
                          onChange={(e) =>
                            handleChangeScholastic(subject, "SA", e)
                          }
                          min={0}
                          max={60}
                          required
                          disabled={formSubmitted}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={marks.OralSA}
                          onChange={(e) =>
                            handleChangeScholastic(subject, "OralSA", e)
                          }
                          min={0}
                          max={10}
                          required
                          disabled={formSubmitted}
                        />
                      </td>
                      <td>{marks.overallMarks}</td>
                    </tr>
                  );
                } else {
                  return null;
                }
              })}
              <tr>
                <th>GrandTotal:</th>
                <td colSpan="5">{scholasticData.GrandTotal?.overallMarks}</td>
              </tr>
              <tr>
                <th>Percentage:</th>
                <td colSpan="5">
                  {scholasticData.GrandTotal?.percentageOfGD}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="co-scholastic-area">
          <h3>Part - 2 : Co-Scholastic Area</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Grade(A|A+|B)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(activities).map(([activity, index]) => (
                <tr key={index}>
                  <td>{activity}</td>
                  <td>
                    <Form.Control
                      type="text"
                      name="grade"
                      value={activity.grade}
                      onChange={(e) => handleChangeActivity(index, e)}
                      pattern="^(B|A|A\+)$"
                      required
                      disabled={formSubmitted}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="attendance-area">
          <h3>Part - 3 : Attendance</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Number of Working Days</th>
                <th>Number of Days Present</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Form.Control
                    type="number"
                    name="workingDays"
                    value={attendanceData.workingDays}
                    onChange={(e) =>
                      setAttendanceData({
                        ...attendanceData,
                        workingDays: e.target.value,
                      })
                    }
                    min={0}
                    max={366}
                    required
                    disabled={formSubmitted}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    name="daysPresent"
                    value={attendanceData.daysPresent}
                    onChange={(e) =>
                      setAttendanceData({
                        ...attendanceData,
                        daysPresent: e.target.value,
                      })
                    }
                    min={0}
                    max={366}
                    required
                    disabled={formSubmitted}
                  />
                </td>
                <td>{attendanceData.percentage}%</td>
              </tr>
            </tbody>
          </Table>
        </div>
        <th>C.G.P :</th>
        <td>{attendanceData.cgpa}</td>
        <th>Grade :</th>
        <td>{attendanceData.grade}</td>
        <th>Teacher's Remarks :</th>
        <td>{attendanceData.teacherRemarks}</td>
        <div className="gradingScale">
          <GradingScaleTable />
        </div>
        {showDownloadButton ? (
          <Button
            variant="primary"
            className="exclude-from-pdf"
            onClick={handleDownloadPDF}
          >
            Download
          </Button>
        ) : (
          <>
            <ResetButton onClick={handleReset} />
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </>
        )}
      </Form>
    </>
  );
};

export default ScoreCardForm;

import React, { useState, useRef } from "react";
import { Form, Button, Table } from "react-bootstrap";
import ClearButton from "./ClearButton";
import "./ScoreCard.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./GradingScale.css";

const ScoreCard = ({ onSubmit }) => {
  const scoreCardFormRef = useRef(null);

  const FT_MAX_MARKS = 20;
  const ORAL_MAX_MARKS = 10;
  const SA_MAX_MARKS = 60;
  const ORAL_SA_MAX_MARKS = 10;
  const OVERALL_MAX_MARKS = 100;

  const [count, setCount] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [scholasticSubjects, setscholasticSubjects] = useState({});
  const [studentAttendance, setstudentAttendance] = useState({
    workingDays: "",
    daysPresent: "",
    percentage: "",
    cgpa: "",
    grade: "",
    teacherRemarks: "",
  });

  const [dailyTasks, setdailyTasks] = useState({});

  const [isFormProcessed, setisFormProcessed] = useState(false);
  const [displayDownloadButton, setdisplayDownloadButton] = useState(false);
  const [enteredSubject, setEnteredSubject] = useState("");
  const [upcomingTask, setupcomingTask] = useState("");
  const [hasSubjectBeenAdded, sethasSubjectBeenAdded] = useState(false);
  // const [FormProcessed, setFormProcessed] = useState(false);

  const handleSubjectInputChange = (event) => {
    setEnteredSubject(event.target.value);
  };

  const addNewSubject = () => {
    const alphabeticPattern = /^[a-zA-Z]+$/;
    setCount(count + 1);
    if (!alphabeticPattern.test(enteredSubject.trim())) {
      alert("Please enter alphabetic characters only for the subject name.");
      return;
    }

    if (enteredSubject.trim() === "") {
      return;
    }

    setscholasticSubjects({
      ...scholasticSubjects,
      [enteredSubject]: { FT: "", Oral: "", SA: "", OralSA: "" },
    });
    setEnteredSubject("");
    sethasSubjectBeenAdded(true);
  };

  const handleChangeupcomingTask = (event) => {
    setupcomingTask(event.target.value);
  };

  const addNewActivity = () => {
    const pattern = /^[a-zA-Z]+$/;
    if (pattern.test(upcomingTask.trim())) {
      if (upcomingTask.trim() !== "") {
        setdailyTasks({
          ...dailyTasks,
          [upcomingTask]: { Grade: "" },
        });
        setupcomingTask("");
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
      e.target.value = "";
      return;
    }

    setscholasticSubjects({
      ...scholasticSubjects,
      [subject]: {
        ...scholasticSubjects[subject],
        [subCategory]: parseInt(value),
      },
    });
  };

  const handleChangeActivity = (index, e) => {
    <></>;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!studentName.trim() || !rollNumber.trim()) {
      alert("Student name and roll number are required fields.");
      return;
    }

    if (Object.keys(scholasticSubjects).length === 0) {
      alert("Please add at least one subject before submitting.");
      return;
    }

    if (Object.keys(dailyTasks).length === 0) {
      alert("Please add at least one activity before submitting.");
      return;
    }

    const scholasticDataWithOverallMarks = { ...scholasticSubjects };
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

    const { workingDays, daysPresent } = studentAttendance;
    const percentage = ((daysPresent / workingDays) * 100).toFixed(2);
    const OverCount = count * OVERALL_MAX_MARKS;
    const grandTotalPercentage = ((grandTotal / OverCount) * 100).toFixed(2);

    const cgpa = parseFloat((grandTotalPercentage / 10).toFixed(2));

    setscholasticSubjects({
      ...scholasticDataWithOverallMarks,
      GrandTotal: {
        overallMarks: grandTotal,
        percentageOfGD: grandTotalPercentage,
      },
    });

    let grade, teacherRemarks;

    switch (true) {
      case grandTotalPercentage > 90:
        grade = "A1";
        teacherRemarks = "Excellent";
        break;
      case grandTotalPercentage > 80:
        grade = "A2";
        teacherRemarks = "Very Good";
        break;
      case grandTotalPercentage > 70:
        grade = "B1";
        teacherRemarks = "Good";
        break;
      case grandTotalPercentage > 60:
        grade = "B2";
        teacherRemarks = "Satisfactory";
        break;
      case grandTotalPercentage > 50:
        grade = "C1";
        teacherRemarks = "Satisfactory";
        break;
      case grandTotalPercentage > 40:
        grade = "C2";
        teacherRemarks = "Unsatisfactory";
        break;
      default:
        grade = "D";
        teacherRemarks = "FAIL";
        break;
    }

    setstudentAttendance({
      ...studentAttendance,
      percentage,
      grade,
      cgpa,
      teacherRemarks,
    });

    onSubmit({
      studentName,
      rollNumber,
      scholasticSubjects: scholasticDataWithOverallMarks,
      studentAttendance,
      grandTotalPercentage,
    });
    setdisplayDownloadButton(true);
    setisFormProcessed(true);
  };

  const handleDownloadPDF = () => {
    const excludedElements = document.querySelectorAll(".exclude-from-pdf");
    excludedElements.forEach((element) => {
      element.style.display = "none";
    });
    if (!scoreCardFormRef.current) return;

    html2canvas(scoreCardFormRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("score_card.pdf");

      handleReset();
    });

    setdisplayDownloadButton(false);
    setisFormProcessed(false);
  };

  const handleReset = () => {
    setEnteredSubject("");
    setupcomingTask("");
    setStudentName("");
    setRollNumber("");
    setstudentAttendance({
      workingDays: "",
      daysPresent: "",
      percentage: "",
      cgpa: "",
      grade: "",
      teacherRemarks: "",
    });
    setscholasticSubjects({});
    setdailyTasks({});
    setdisplayDownloadButton(false);
    setisFormProcessed(false);
  };

  return (
    <>
      <Form
        ref={scoreCardFormRef}
        onSubmit={handleSubmit}
        className="report-card-form"
      >
        <h1>FIRST TERMINAL EXAMINATION 2024-25</h1>
        <h2>ACADEMIC PERFORMANCE</h2>

        <div>
          <Form.Label className="bold-label">
            Student Name
          </Form.Label>
          &nbsp;
          <Form.Control
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Please Enter The Student Name"
            pattern="[A-Za-z ]+"
            title="Please Enter Alphabetic Characters Only"
            required
            disabled={isFormProcessed}
            style={{ width: "300px" }}
          />
        </div>

        <div>
          <Form.Label className="bold-label">
            Roll Number
          </Form.Label>
          &nbsp;
          <Form.Control
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="Please Enter The Roll Number"
            pattern="[0-9]+"
            title="Please Enter Numeric Characters Only"
            required
            disabled={isFormProcessed}
            style={{ width: "300px" }}
          />
        </div>

        <div style={{ display: isFormProcessed ? "none" : "block" }}>
          <Button onClick={addNewSubject} disabled={isFormProcessed}>
            Add Subject
          </Button>
          &nbsp;
          {isFormProcessed ? null : (
            <Form.Control
              type="text"
              value={enteredSubject}
              onChange={handleSubjectInputChange}
              placeholder="Please Enter The Subject Name"
              title="Please Enter Alphabetic Characters Only"
              style={{ width: "300px" }}
            />
          )}
        </div>
        <div style={{ display: isFormProcessed ? "none" : "block" }}>
          <Button onClick={addNewActivity} disabled={isFormProcessed}>
            Add Activity
          </Button>
          &nbsp;
          {isFormProcessed ? null : (
            <Form.Control
              type="text"
              value={upcomingTask}
              onChange={handleChangeupcomingTask}
              placeholder="Please Enter The Activity Name"
              title="Please Enter Alphabetic Characters Only"
              style={{ width: "300px" }}
            />
          )}
        </div>
        <div className="academic-section">
          <h3>Part - 1 : Scholastic Area</h3>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>FT-{FT_MAX_MARKS}</th>
                <th>Oral-{ORAL_MAX_MARKS}</th>
                <th>SA-{SA_MAX_MARKS}</th>
                <th>OralSA-{ORAL_SA_MAX_MARKS}</th>
                <th>Overall Marks-{OVERALL_MAX_MARKS}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scholasticSubjects).map(([subject, marks]) => {
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
                          max={FT_MAX_MARKS}
                          required
                          disabled={isFormProcessed}
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
                          max={ORAL_MAX_MARKS}
                          required
                          disabled={isFormProcessed}
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
                          max={SA_MAX_MARKS}
                          required
                          disabled={isFormProcessed}
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
                          max={ORAL_SA_MAX_MARKS}
                          required
                          disabled={isFormProcessed}
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
                <td colSpan="1">
                  {scholasticSubjects.GrandTotal?.overallMarks}
                </td>
              </tr>
              <tr>
                <th>Percentage:</th>
                <td colSpan="1">
                  {scholasticSubjects.GrandTotal?.percentageOfGD}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="extracurricular-section">
          <h3>Part - 2 : Co-Scholastic Area</h3>
          <Table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Grade(A|A+|B)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dailyTasks).map(([activity, index]) => (
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
                      disabled={isFormProcessed}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="attendance-section">
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
                    value={studentAttendance.workingDays}
                    onChange={(e) =>
                      setstudentAttendance({
                        ...studentAttendance,
                        workingDays: e.target.value,
                      })
                    }
                    min={0}
                    max={60}
                    required
                    disabled={isFormProcessed}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    name="daysPresent"
                    value={studentAttendance.daysPresent}
                    onChange={(e) =>
                      setstudentAttendance({
                        ...studentAttendance,
                        daysPresent: e.target.value,
                      })
                    }
                    min={0}
                    max={60}
                    required
                    disabled={isFormProcessed}
                  />
                </td>
                <td>{studentAttendance.percentage}%</td>
              </tr>
            </tbody>
          </Table>
        </div>
        <th>C.G.P :</th>
        <td>{studentAttendance.cgpa}</td>
        <th>Grade :</th>
        <td>{studentAttendance.grade}</td>
        <th>Teacher's Remarks :</th>
        <td>{studentAttendance.teacherRemarks}</td>
        <div className="gradingScale"></div>
        <div className="GradingScale">
          <table>
            <thead>
              <tr>
                <th colSpan="3">Grading Scale</th>
              </tr>
              <tr>
                <th>Marking Range</th>
                <th>Grades</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>91-100</td>
                <td>A1</td>
                <td>Excellent</td>
              </tr>
              <tr>
                <td>81-90</td>
                <td>A2</td>
                <td>Very Good</td>
              </tr>
              <tr>
                <td>71-80</td>
                <td>B1</td>
                <td>Good</td>
              </tr>
              <tr>
                <td>61-70</td>
                <td>B2</td>
                <td>Satisfactory</td>
              </tr>
              <tr>
                <td>51-60</td>
                <td>C1</td>
                <td>Satisfactory</td>
              </tr>
              <tr>
                <td>40-50</td>
                <td>C2</td>
                <td>Unsatisfactory</td>
              </tr>
              <tr>
                <td>Below 40</td>
                <td>D</td>
                <td>Fail</td>
              </tr>
            </tbody>
          </table>
        </div>

        {displayDownloadButton ? (
          <Button
            variant="primary"
            className="exclude-from-pdf"
            onClick={handleDownloadPDF}
          >
            Download
          </Button>
        ) : (
          <>
            <ClearButton handleClearButtonClick={handleReset} />
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </>
        )}
      </Form>
    </>
  );
};

export default ScoreCard;

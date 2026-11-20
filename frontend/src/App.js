
import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/users";
const COURSE_API = "http://localhost:5000/api/courses";

const defaultCourses = [
  {
    id: 1,
    title: "HTML & CSS Basics",
    category: "Web Development",
    description: "Learn HTML structure, CSS styling and responsive design.",
    lessons: [
      "Introduction to HTML",
      "HTML Elements and Forms",
      "Introduction to CSS",
      "CSS Layout and Responsive Design"
    ]
  },
  {
    id: 2,
    title: "JavaScript Programming",
    category: "Programming",
    description: "Learn JavaScript fundamentals and interactive programming.",
    lessons: [
      "JavaScript Introduction",
      "Variables and Data Types",
      "Functions and Arrays",
      "DOM Manipulation"
    ]
  },
  {
    id: 3,
    title: "React JS",
    category: "Web Development",
    description: "Learn components, props, state and React hooks.",
    lessons: [
      "Introduction to React",
      "Components and Props",
      "State and Events",
      "React Hooks"
    ]
  },
  {
    id: 4,
    title: "Finite Automata",
    category: "Computer Science",
    description: "Understand DFA, NFA, states and transition functions.",
    lessons: [
      "Introduction to Finite Automata",
      "States and Alphabets",
      "Deterministic Finite Automata",
      "Non-Deterministic Finite Automata"
    ]
  }
];

const quizQuestions = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyper Tool Multi Language",
      "Home Text Markup Language"
    ],
    answer: 0
  },
  {
    question: "Which language is used to style web pages?",
    options: ["Java", "CSS", "Python", "C"],
    answer: 1
  },
  {
    question: "Which method is used to print output in JavaScript?",
    options: ["print()", "echo()", "console.log()", "display()"],
    answer: 2
  },
  {
    question: "What is DFA?",
    options: [
      "Data Flow Algorithm",
      "Deterministic Finite Automaton",
      "Digital Function Array",
      "Dynamic File Access"
    ],
    answer: 1
  }
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [page, setPage] = useState("student");
  const [authMode, setAuthMode] = useState("login");

  const [user, setUser] = useState(() =>
    readStorage("elearningUser", null)
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeSection, setActiveSection] = useState("Overview");

  // Finite Automata
  const [dfaState, setDfaState] = useState(() =>
    readStorage("elearningDFAState", "Q0")
  );

  useEffect(() => {
    localStorage.setItem(
      "elearningDFAState",
      JSON.stringify(dfaState)
    );
  }, [dfaState]);

  const dfaStates = [
    { id: "Q0", title: "Not Logged In", detail: "Initial state" },
    { id: "Q1", title: "Login Successful", detail: "Student authenticated" },
    { id: "Q2", title: "Course / Lesson Started", detail: "A course is selected" },
    { id: "Q3", title: "Lesson Completed", detail: "At least one lesson is completed" },
    { id: "Q4", title: "Quiz Passed", detail: "Final accepting state" }
  ];

  const dfaTransitions = [
    { from: "Q0", input: "Valid login", to: "Q1" },
    { from: "Q1", input: "Select course", to: "Q2" },
    { from: "Q2", input: "Complete lesson", to: "Q3" },
    { from: "Q3", input: "Pass quiz (score >= 3)", to: "Q4" }
  ];

  const [courses, setCourses] = useState(() =>
    readStorage("elearningCourses", defaultCourses)
  );

  const [progress, setProgress] = useState({});

  const [students, setStudents] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(0);
const [lessonSeconds, setLessonSeconds] = useState(0);
const [lessonReady, setLessonReady] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  const [newCourse, setNewCourse] = useState({
    title: "",
    category: "",
    description: "",
    lessons: ""
  });

  // Save user
  // One-minute lesson timer
  // 20-second lesson timer
useEffect(() => {
  if (!user || !selectedCourse) {
    setLessonSeconds(0);
    setLessonReady(false);
    return;
  }

  const timerKey = `lessonTimer_${user.id}_${selectedCourse.id}_${activeLesson}`;

  const savedSeconds = Math.min(
    Number(localStorage.getItem(timerKey) || 0),
    20
  );

  setLessonSeconds(savedSeconds);
  setLessonReady(savedSeconds >= 20);

  if (savedSeconds >= 20) return;

  let interval;

  const startTimer = () => {
    clearInterval(interval);

    interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;

      setLessonSeconds((previous) => {
        const updated = Math.min(previous + 1, 20);

        localStorage.setItem(timerKey, updated);

        if (updated >= 20) {
          setLessonReady(true);
          clearInterval(interval);
        }

        return updated;
      });
    }, 1000);
  };

  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      startTimer();
    } else {
      clearInterval(interval);
    }
  };

  startTimer();

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, [user, selectedCourse, activeLesson]);
  useEffect(() => {
    if (user) {
      localStorage.setItem("elearningUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("elearningUser");
    }
  }, [user]);


  // Save courses
  useEffect(() => {
    localStorage.setItem("elearningCourses", JSON.stringify(courses));
  }, [courses]);

  // Fetch students for staff
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user || user.role !== "admin") return;

      setStudentLoading(true);
      setStudentError("");

      try {
        const response = await fetch(`${API_URL}/students`);
        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            "Backend returned HTML instead of JSON. Check backend route."
          );
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch students");
        }

        setStudents(data.students || []);
      } catch (error) {
        setStudentError(error.message);
      } finally {
        setStudentLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  // Fetch courses from MongoDB
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(COURSE_API);

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();

        const formattedCourses = data.map(course => ({
          ...course,
          id: course._id,
          lessons: (course.lessons || []).map(lesson =>
            typeof lesson === "string" ? lesson : lesson.title
          )
        }));

        setCourses(formattedCourses);
      } catch (error) {
        console.error("Course fetch error:", error);
      }
    };

    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Fetch logged-in student's saved progress
  useEffect(() => {
    const fetchStudentProgress = async () => {
      if (!user || user.role !== "student" || !user.id) return;

      try {
        const response = await fetch(
          `${API_URL}/progress/${user.id}`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch student progress");
        }

        const data = await response.json();
        setProgress(data.progress || {});
      } catch (error) {
        console.error("Progress fetch error:", error);
      }
    };

    fetchStudentProgress();
  }, [user]);

  // Registration and login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint =
        authMode === "register" ? "/register" : "/login";

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (authMode === "register") {
        setMessage("Registration successful! Please login.");
        setAuthMode("login");

        setFormData({
          name: "",
          email: formData.email,
          password: ""
        });
      } else {
        setUser(data.user);
        setDfaState("Q1");
        setPage(data.user.role === "admin" ? "staff" : "student");
        setActiveSection("Overview");
        setMessage("");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setDfaState("Q0");
    setSelectedCourse(null);
    setActiveSection("Overview");

    setFormData({
      name: "",
      email: "",
      password: ""
    });

    setMessage("");
  };

  // Course progress
  const getCompletedLessons = (courseId) => {
    return progress[courseId]?.completed || [];
  };

  const getCourseProgress = (course) => {
    const completed = getCompletedLessons(course.id).length;
    const total = course.lessons.length;

    return total === 0
      ? 0
      : Math.round((completed / total) * 100);
  };

  const getOverallProgress = () => {
    if (courses.length === 0) return 0;

    const totalLessons = courses.reduce(
      (sum, course) => sum + course.lessons.length,
      0
    );

    if (totalLessons === 0) return 0;

    const completedLessons = courses.reduce(
      (sum, course) => sum + getCompletedLessons(course.id).length,
      0
    );

    return Math.round((completedLessons / totalLessons) * 100);
  };

  // Calculate individual student progress
  const getStudentProgress = (student) => {
    const totalLessons = courses.reduce(
      (sum, course) => sum + (course.lessons?.length || 0),
      0
    );

    const completedLessons = courses.reduce((sum, course) => {
      return sum + (
        student.progress?.[course.id]?.completed?.length || 0
      );
    }, 0);

    return totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);
  };

  const getStudentCompletedCourses = (student) => {
    return courses.filter((course) => {
      const completed =
        student.progress?.[course.id]?.completed || [];

      return course.lessons.length > 0 &&
        completed.length >= course.lessons.length;
    }).length;
  };

  // Complete lesson and save student progress
  // Open selected course
const openCourse = (course) => {
  setSelectedCourse(course);
  setActiveLesson(0);
  setDfaState("Q2");
};
// Complete lesson and save student progress
const completeLesson = async () => {
  if (!selectedCourse) return;

  if (lessonSeconds < 20) {
    alert("You can mark this lesson as read only after 1 minute.");
    return;
  }

  const courseId = selectedCourse.id;
  const completed = getCompletedLessons(courseId);

  if (completed.includes(activeLesson)) return;

  const updatedProgress = {
    ...progress,
    [courseId]: {
      completed: [
        ...(progress[courseId]?.completed || []),
        activeLesson
      ]
    }
  };

  if (user?.id) {
    try {
      const response = await fetch(
        `${API_URL}/progress/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            progress: updatedProgress
          })
        }
      );

      if (!response.ok) {
        throw new Error("Progress save failed");
      }
    } catch (error) {
      console.error("Progress save error:", error);
      alert("Unable to save progress. Please try again.");
      return;
    }
  }

  setProgress(updatedProgress);

  setDfaState((current) =>
    current === "Q4" ? "Q4" : "Q3"
  );

  alert("Lesson completed successfully!");
};

  // Quiz
  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers((previous) => ({
      ...previous,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = () => {
    const score = quizQuestions.reduce((total, question, index) => {
      return total + (
        quizAnswers[index] === question.answer ? 1 : 0
      );
    }, 0);

    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= 3) {
      setDfaState((current) =>
        current === "Q3" || current === "Q4" ? "Q4" : current
      );
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // Staff add course
  const handleAddCourse = async (e) => {
    e.preventDefault();

    if (
      !newCourse.title.trim() ||
      !newCourse.category.trim() ||
      !newCourse.description.trim() ||
      !newCourse.lessons.trim()
    ) {
      alert("Please fill all course fields.");
      return;
    }

    try {
      const courseData = {
        title: newCourse.title,
        category: newCourse.category,
        description: newCourse.description,
        lessons: newCourse.lessons
          .split("\n")
          .map((lesson) => lesson.trim())
          .filter(Boolean)
      };

      const response = await fetch(COURSE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(courseData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add course");
      }

      const formattedCourse = {
        ...data,
        id: data._id,
        lessons: (data.lessons || []).map((lesson) =>
          typeof lesson === "string" ? lesson : lesson.title
        )
      };

      setCourses((previous) => [...previous, formattedCourse]);

      setNewCourse({
        title: "",
        category: "",
        description: "",
        lessons: ""
      });

      alert("Course saved successfully in MongoDB!");
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const response = await fetch(`${COURSE_API}/${courseId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete course");
      }

      setCourses((previous) =>
        previous.filter((course) => course.id !== courseId)
      );

      alert("Course deleted successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredCourses = courses.filter((course) =>
    `${course.title} ${course.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Login / Registration page
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand-icon">E</div>

          <h1>E-Learning System</h1>
          <p className="auth-subtitle">
            Student Learning and Progress Tracking
          </p>

          <div className="tab-buttons">
            <button
              className={page === "student" ? "active" : ""}
              onClick={() => {
                setPage("student");
                setMessage("");
              }}
            >
              Student
            </button>

            <button
              className={page === "staff" ? "active" : ""}
              onClick={() => {
                setPage("staff");
                setMessage("");
              }}
            >
              Staff
            </button>
          </div>

          <h2>
            {authMode === "login" ? "Welcome Back" : "Create Account"}
          </h2>

          <p className="form-description">
            {authMode === "login"
              ? "Enter your details to continue"
              : "Register to start learning"}
          </p>

          <form onSubmit={handleSubmit}>
            {authMode === "register" && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <button
              type="submit"
              className="primary-btn full-btn"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : authMode === "login"
                ? "Login"
                : "Register"}
            </button>
          </form>

          {message && (
            <p className="auth-message">{message}</p>
          )}

          <p className="switch-text">
            {authMode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              onClick={() => {
                setAuthMode(
                  authMode === "login" ? "register" : "login"
                );
                setMessage("");
              }}
            >
              {authMode === "login" ? "Register" : "Login"}
            </button>
          </p>

          {page === "staff" && (
            <p className="staff-note">
              Staff login requires the admin account created in the backend.
            </p>
          )}
        </div>
      </div>
    );
  }

  const isStaff = user.role === "admin";

  const studentMenu = [
    "Overview",
    "Courses",
    "Learning",
    "Quiz",
    "My Progress",
    "DFA Status"
  ];

  const staffMenu = [
    "Overview",
    "Manage Students",
    "Manage Courses"
  ];

  const menuItems = isStaff ? staffMenu : studentMenu;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="small-brand-icon">E</div>
          <div>
            <h2>E-Learning</h2>
            <span>Learning Portal</span>
          </div>
        </div>

        <div className="profile-box">
          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3>{user.name}</h3>
            <p>{isStaff ? "Staff / Admin" : "Student"}</p>
          </div>
        </div>

        <p className="menu-label">MAIN MENU</p>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item}
              className={
                activeSection === item ||
                (item === "Courses" && activeSection === "Learning")
                  ? "menu-item selected"
                  : "menu-item"
              }
              onClick={() => {
                setActiveSection(item);
                setSelectedCourse(null);
                setSearch("");
              }}
            >
              <span>
                {item === "Overview" && "⌂"}
                {item === "Courses" && "▣"}
                {item === "Learning" && "▶"}
                {item === "Quiz" && "✎"}
                {item === "My Progress" && "▥"}
                {item === "DFA Status" && "◎"}
                {item === "Manage Students" && "♙"}
                {item === "Manage Courses" && "▤"}
              </span>
              {item}
            </button>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          ⇥ Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>{activeSection}</h2>
            <p>Welcome to your learning dashboard</p>
          </div>

          <div className="topbar-user">
            <span>{user.name}</span>
            <div className="topbar-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="content-area">

          {/* STUDENT OVERVIEW */}
          {!isStaff && activeSection === "Overview" && (
            <>
              <section className="welcome-banner">
                <div>
                  <h1>Hello, {user.name}!</h1>
                  <p>
                    Continue your learning journey and improve your skills.
                  </p>
                  <button
                    className="banner-btn"
                    onClick={() => setActiveSection("Courses")}
                  >
                    Explore Courses
                  </button>
                </div>
                <div className="banner-symbol">🎓</div>
              </section>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">📚</span>
                  <p>Available Courses</p>
                  <h2>{courses.length}</h2>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">✓</span>
                  <p>Completed Lessons</p>
                  <h2>
                    {Object.values(progress).reduce(
                      (sum, item) => sum + (item.completed?.length || 0),
                      0
                    )}
                  </h2>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">📈</span>
                  <p>Overall Progress</p>
                  <h2>{getOverallProgress()}%</h2>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">📝</span>
                  <p>Quiz Questions</p>
                  <h2>{quizQuestions.length}</h2>
                </div>
              </div>

<section className="section-card recent-students-card">
                  <div className="section-heading">
                  <h2>Recommended Courses</h2>
                  <button
                    className="text-btn"
                    onClick={() => setActiveSection("Courses")}
                  >
                    View All
                  </button>
                </div>

                <div className="course-grid">
                  {courses.slice(0, 3).map((course) => (
                    <div className="course-card" key={course.id}>
                      <div className="course-icon">📘</div>
                      <span className="category-tag">
                        {course.category}
                      </span>
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${getCourseProgress(course)}%`
                          }}
                        />
                      </div>

                      <div className="course-bottom">
                        <span>{getCourseProgress(course)}% completed</span>
                        <button onClick={() => openCourse(course)}>
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* STUDENT COURSES */}
          {!isStaff && activeSection === "Courses" && (
            <section className="section-card">
              <div className="section-heading">
                <div>
                  <h2>Explore Courses</h2>
                  <p>Choose a course and start learning.</p>
                </div>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="course-grid">
                {filteredCourses.map((course) => (
                  <div className="course-card" key={course.id}>
                    <div className="course-icon">📘</div>
                    <span className="category-tag">
                      {course.category}
                    </span>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <p>{course.lessons.length} Lessons</p>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${getCourseProgress(course)}%`
                        }}
                      />
                    </div>

                    <div className="course-bottom">
                      <span>
                        {getCourseProgress(course)}% completed
                      </span>
                      <button onClick={() => openCourse(course)}>
                        Start Learning
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <p className="empty-message">No courses found.</p>
              )}
            </section>
          )}

          {/* LEARNING PAGE */}
          {!isStaff && activeSection === "Learning" && (
            <section className="section-card">
              {selectedCourse ? (
                <>
                  <button
                    className="text-btn"
                    onClick={() => {
                      setSelectedCourse(null);
                      setActiveSection("Courses");
                    }}
                  >
                    ← Back to Courses
                  </button>

                  <h2>{selectedCourse.title}</h2>
                  <p>{selectedCourse.description}</p>

                  <div className="learning-layout">
                    <div className="lesson-list">
                      <h3>Course Lessons</h3>

                      {selectedCourse.lessons.map((lesson, index) => {
                        const isCompleted =
                          getCompletedLessons(selectedCourse.id)
                            .includes(index);

                        return (
                          <button
                            key={index}
                            className={
                              activeLesson === index
                                ? "lesson-item active"
                                : "lesson-item"
                            }
                            onClick={() => setActiveLesson(index)}
                          >
                            <span>
                              {isCompleted ? "✓" : index + 1}
                            </span>
                            {lesson}
                          </button>
                        );
                      })}
                    </div>

                    <div className="lesson-content">
                      <span className="category-tag">
                        Lesson {activeLesson + 1}
                      </span>

                      <h2>
                        {selectedCourse.lessons[activeLesson]}
                      </h2>

                      <p>
                        Welcome to this lesson. Read the lesson topic
                        carefully and understand the concepts.
                      </p>

                      <div className="lesson-information">
                        <h3>Learning Objectives</h3>
                        <ul>
                          <li>Understand the basic concepts.</li>
                          <li>Learn important definitions.</li>
                          <li>Practice the concepts.</li>
                          <li>Complete the lesson successfully.</li>
                        </ul>
                      </div>
{getCompletedLessons(selectedCourse.id).includes(activeLesson) ? (
  <p className="success-message">
    ✓ This lesson is already completed.
  </p>
) : (
  <>
    <div className="lesson-timer-card">
      <h3>Lesson Reading Time</h3>

      <h2>
       {`00:${String(Math.max(0, 20 - lessonSeconds)).padStart(2, "0")}`}
       </h2>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
           width: `${Math.min((lessonSeconds / 20) * 100, 100)}%`
          }}
        />
      </div>

      <p>
        {lessonReady
          ? "Minimum reading time completed!"
          : "Please spend at least 30 sec on this lesson."}
      </p>
    </div>
<button
  className="primary-btn"
  onClick={completeLesson}
  disabled={!lessonReady}
>
  {lessonReady
    ? "Mark as Completed"
    : "Available After 20 Seconds"}
</button>
  </>
)}

                      <div className="lesson-navigation">
                        <button
                          disabled={activeLesson === 0}
                          onClick={() =>
                            setActiveLesson((previous) => previous - 1)
                          }
                        >
                          Previous
                        </button>

                        <button
                          disabled={
                            activeLesson ===
                            selectedCourse.lessons.length - 1
                          }
                          onClick={() =>
                            setActiveLesson((previous) => previous + 1)
                          }
                        >
                          Next Lesson
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2>Continue Learning</h2>
                  <p>Select a course to start your lesson.</p>

                  <div className="course-grid">
                    {courses.map((course) => (
                      <div className="course-card" key={course.id}>
                        <div className="course-icon">📖</div>
                        <h3>{course.title}</h3>
                        <p>{course.description}</p>
                        <button onClick={() => openCourse(course)}>
                          Open Course
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {/* QUIZ PAGE */}
          {!isStaff && activeSection === "Quiz" && (
            <section className="section-card">
              <h2>Knowledge Assessment</h2>
              <p>Answer all questions and submit your quiz.</p>

              <div className="quiz-information">
                <span>Total Questions: {quizQuestions.length}</span>
                <span>Pass Mark: 3 / 4</span>
              </div>

              {quizQuestions.map((question, questionIndex) => (
                <div className="question-card" key={questionIndex}>
                  <h3>
                    {questionIndex + 1}. {question.question}
                  </h3>

                  <div className="quiz-options">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={
                          quizAnswers[questionIndex] === optionIndex
                            ? "quiz-option selected"
                            : "quiz-option"
                        }
                      >
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          checked={
                            quizAnswers[questionIndex] === optionIndex
                          }
                          disabled={quizSubmitted}
                          onChange={() =>
                            handleQuizAnswer(
                              questionIndex,
                              optionIndex
                            )
                          }
                        />
                        {option}
                      </label>
                    ))}
                  </div>

                  {quizSubmitted && (
                    <p
                      className={
                        quizAnswers[questionIndex] === question.answer
                          ? "correct-answer"
                          : "wrong-answer"
                      }
                    >
                      {quizAnswers[questionIndex] === question.answer
                        ? "Correct answer!"
                        : `Correct answer: ${
                            question.options[question.answer]
                          }`}
                    </p>
                  )}
                </div>
              ))}

              {!quizSubmitted ? (
                <button
                  className="primary-btn"
                  onClick={submitQuiz}
                  disabled={
                    Object.keys(quizAnswers).length !==
                    quizQuestions.length
                  }
                >
                  Submit Quiz
                </button>
              ) : (
                <div className="quiz-result">
                  <h2>
                    Your Score: {quizScore} / {quizQuestions.length}
                  </h2>

                  {quizScore >= 3 ? (
                    <p className="success-message">
                      Congratulations! You passed the quiz.
                      {dfaState === "Q4"
                        ? " DFA reached the final accepting state Q4."
                        : " Complete a lesson to unlock the DFA final state."}
                    </p>
                  ) : (
                    <p className="error-message">
                      You did not pass. Try again!
                    </p>
                  )}

                  <button
                    className="primary-btn"
                    onClick={resetQuiz}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </section>
          )}

          {/* MY PROGRESS PAGE */}
          {!isStaff && activeSection === "My Progress" && (
            <section className="section-card">
              <h2>My Learning Progress</h2>
              <p>Track your course completion status.</p>

              <div className="overall-progress-card">
                <h3>Overall Learning Progress</h3>
                <h1>{getOverallProgress()}%</h1>

                <div className="progress-track large-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${getOverallProgress()}%`
                    }}
                  />
                </div>
              </div>

              <div className="progress-course-list">
                {courses.map((course) => (
                  <div className="progress-course-item" key={course.id}>
                    <div>
                      <h3>{course.title}</h3>
                      <p>
                        {getCompletedLessons(course.id).length} of{" "}
                        {course.lessons.length} lessons completed
                      </p>
                    </div>

                    <div className="progress-course-right">
                      <strong>{getCourseProgress(course)}%</strong>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${getCourseProgress(course)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* COURSE PROGRESS BAR GRAPH */}
              <div className="section-card">
                <h2>Course Progress Bar Graph</h2>
                <p>Visual representation of course completion.</p>

                <div className="bar-chart">
                  {courses.map((course) => {
                    const percentage = getCourseProgress(course);

                    return (
                      <div className="bar-item" key={course.id}>
                        <div className="bar-label">
                          <span>{course.title}</span>
                          <strong>{percentage}%</strong>
                        </div>

                        <div className="bar-background">
                          <div
                            className="bar-fill"
                            style={{ height: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* DFA STATUS PAGE */}
          {activeSection === "DFA Status" && (
            <div className="dfa-container">

              <div className="dfa-heading">
                <h2>Learning Journey – DFA</h2>
                <p>Track your learning journey through Finite Automata.</p>
              </div>

              <div className="dfa-summary">
                <div>
                  <h3>Current DFA State</h3>
                  <h1>{dfaState}</h1>
                  <p>
                    {dfaStates.find((state) => state.id === dfaState)?.title}
                  </p>
                </div>

                <div
                  className="dfa-circle"
                  style={{
                    background: `conic-gradient(#4f46e5 ${
                      (Math.max(0, dfaStates.findIndex((state) => state.id === dfaState)) / 4) * 100
                    }%, #e5e7eb 0%)`
                  }}
                >
                  <div className="dfa-circle-inner">
                    <h2>
                      {Math.round(
                        (Math.max(0, dfaStates.findIndex((state) => state.id === dfaState)) / 4) * 100
                      )}%
                    </h2>
                    <span>Completed</span>
                  </div>
                </div>
              </div>

              <div className="dfa-progress-section">
                <h3>Your Learning Progress</h3>
                <div className="dfa-progress-track">
                  <div
                    className="dfa-progress-fill"
                    style={{
                      width: `${
                        (Math.max(0, dfaStates.findIndex((state) => state.id === dfaState)) / 4) * 100
                      }%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="dfa-states-section">
                <h3>DFA State Journey</h3>

                <div className="dfa-state-list">
                  {dfaStates.map((state, index) => {
                    const currentIndex = dfaStates.findIndex(
                      (item) => item.id === dfaState
                    );

                    return (
                      <div
                        className={`dfa-state-card ${
                          index < currentIndex
                            ? "completed"
                            : index === currentIndex
                            ? "current"
                            : ""
                        }`}
                        key={state.id}
                      >
                        <div className="dfa-state-circle">
                          {index < currentIndex ? "✓" : state.id}
                        </div>

                        <div>
                          <h4>{state.id} – {state.title}</h4>
                          <p>{state.detail}</p>

                          {index === currentIndex && (
                            <span className="dfa-status-label">Current State</span>
                          )}

                          {index < currentIndex && (
                            <span className="dfa-status-label">Completed</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="dfa-transition-section">
                <h3>Transition History</h3>

                {dfaTransitions.map((transition, index) => {
                  const currentIndex = dfaStates.findIndex(
                    (state) => state.id === dfaState
                  );
                  const completed = currentIndex >= index + 1;

                  return (
                    <div className="dfa-transition" key={index}>
                      <span className={completed ? "transition-done" : "transition-wait"}>
                        {completed ? "✓" : "○"}
                      </span>

                      <div>
                        <strong>{transition.from} → {transition.to}</strong>
                        <p>{transition.input}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {dfaState === "Q4" && (
                <div className="dfa-success">
                  <h3>Congratulations!</h3>
                  <p>You have reached the final accepting state Q4.</p>
                  <p>Your learning journey is completed successfully.</p>
                </div>
              )}

              <div className="dfa-definition">
                <h3>Formal DFA Definition</h3>
                <p><strong>Q:</strong> {`{Q0, Q1, Q2, Q3, Q4}`}</p>
                <p><strong>Initial State:</strong> Q0</p>
                <p><strong>Final State:</strong> Q4</p>
                <p><strong>Language:</strong> Student completes a lesson and passes the quiz.</p>
              </div>

            </div>
          )}

          {/* STAFF OVERVIEW */}
          {isStaff && activeSection === "Overview" && (
            <>
              <section className="welcome-banner">
                <div>
                  <h1>Welcome, {user.name}!</h1>
                  <p>
                    Manage students, courses and learning activities.
                  </p>
                </div>
                <div className="banner-symbol">👨‍🏫</div>
              </section>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">👨‍🎓</span>
                  <p>Total Students</p>
                  <h2>{students.length}</h2>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">📚</span>
                  <p>Total Courses</p>
                  <h2>{courses.length}</h2>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">📖</span>
                  <p>Total Lessons</p>
                  <h2>
                    {courses.reduce(
                      (total, course) =>
                        total + course.lessons.length,
                      0
                    )}
                  </h2>
                </div>
              </div>

              <section className="section-card">
                <div className="section-heading">
                  <h2>Recent Students</h2>
                  <button
                    className="text-btn"
                    onClick={() =>
                      setActiveSection("Manage Students")
                    }
                  >
                    View All
                  </button>
                </div>

                {studentLoading ? (
                  <p>Loading students...</p>
                ) : studentError ? (
                  <p className="error-message">{studentError}</p>
                ) : students.length === 0 ? (
                  <p className="empty-message">
                    No students registered yet.
                  </p>
                ) : (
                  <div className="table-responsive">
<table className="data-table recent-students-table">
                        <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Student Name</th>
                          <th>Email Address</th>
                          <th>Role</th>
                          <th>Completed Courses</th>
                          <th>Overall Progress</th>
                        </tr>
                      </thead>

                      <tbody>
                        {students.slice(0, 5).map((student, index) => (
                          <tr key={student._id || student.email}>
                            <td>{index + 1}</td>
                            <td>{student.name}</td>
                            <td>{student.email}</td>
                            <td>
                              <span className="status-tag">
                                {student.role}
                              </span>
                            </td>
                            <td>
                              {getStudentCompletedCourses(student)} / {courses.length}
                            </td>
                            <td>{getStudentProgress(student)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* STAFF MANAGE STUDENTS - UPDATED CARD DESIGN */}
          {isStaff && activeSection === "Manage Students" && (
            <section className="section-card">
              <div className="section-heading">
                <div>
                  <h2>Manage Students</h2>
                  <p>View registered student details.</p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => {
                    setStudentError("");
                    setUser({ ...user });
                  }}
                >
                  Refresh
                </button>
              </div>

              {studentLoading ? (
                <p>Loading student details...</p>
              ) : studentError ? (
                <p className="error-message">{studentError}</p>
              ) : students.length === 0 ? (
                <p className="empty-message">
                  No students found.
                </p>
              ) : (
                <div className="student-cards-container">
                  {students.slice(0, 5).map((student, index) => (
                    <div
                      className="student-detail-card"
                      key={student._id || student.email}
                    >
                      <div className="student-card-heading">
                        <h3>Student {index + 1}</h3>

                        <span className="status-tag">
                          {student.role}
                        </span>
                      </div>

                      <div className="student-detail-grid">

                        <div className="student-detail-box">
                          <label>S.No</label>
                          <p>{index + 1}</p>
                        </div>

                        <div className="student-detail-box">
                          <label>Student Name</label>
                          <p>{student.name}</p>
                        </div>

                        <div className="student-detail-box">
                          <label>Email Address</label>
                          <p>{student.email}</p>
                        </div>

                        <div className="student-detail-box">
                          <label>Role</label>
                          <p>{student.role}</p>
                        </div>

                        <div className="student-detail-box">
                          <label>Completed Courses</label>
                          <p>
                            {getStudentCompletedCourses(student)} / {courses.length}
                          </p>
                        </div>

                        <div className="student-detail-box">
                          <label>Overall Progress</label>
                          <p>{getStudentProgress(student)}%</p>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* STAFF MANAGE COURSES */}
          {isStaff && activeSection === "Manage Courses" && (
            <>
              <section className="section-card">
                <h2>Add New Course</h2>
                <p>Create a new learning course for students.</p>

                <form
                  className="course-form"
                  onSubmit={handleAddCourse}
                >
                  <div className="form-group">
                    <label>Course Title</label>
                    <input
                      type="text"
                      placeholder="Enter course title"
                      value={newCourse.title}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          title: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      placeholder="Enter category"
                      value={newCourse.category}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          category: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      placeholder="Enter course description"
                      rows="3"
                      value={newCourse.description}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          description: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Lessons</label>
                    <textarea
                      placeholder={
                        "Enter one lesson per line\nLesson 1\nLesson 2\nLesson 3"
                      }
                      rows="5"
                      value={newCourse.lessons}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          lessons: e.target.value
                        })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    + Add Course
                  </button>
                </form>
              </section>

              <section className="section-card">
                <h2>Existing Courses</h2>

                <div className="course-grid">
                  {courses.map((course) => (
                    <div className="course-card" key={course.id}>
                      <div className="course-icon">📚</div>

                      <span className="category-tag">
                        {course.category}
                      </span>

                      <h3>{course.title}</h3>
                      <p>{course.description}</p>

                      <p>
                        <strong>
                          {course.lessons.length} Lessons
                        </strong>
                      </p>

                      <button
                        className="delete-btn"
                        onClick={() => deleteCourse(course.id)}
                      >
                        Delete Course
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;

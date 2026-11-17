
const transitions = {
    NOT_ENROLLED: {
        ENROLL: "ENROLLED"
    },

    ENROLLED: {
        START_LESSON: "LEARNING"
    },

    LEARNING: {
        COMPLETE_LESSON: "LESSON_COMPLETED"
    },

    LESSON_COMPLETED: {
        ATTEMPT_QUIZ: "QUIZ_ATTEMPTED"
    },

    QUIZ_ATTEMPTED: {
        PASS: "COURSE_COMPLETED",
        FAIL: "LEARNING"
    }
};

function validateTransition(currentState, action) {
    const nextState = transitions[currentState]?.[action];

    if (!nextState) {
        return {
            valid: false,
            message: "Invalid Transition!"
        };
    }

    return {
        valid: true,
        currentState: currentState,
        nextState: nextState,
        message: "Valid Transition!"
    };
}

module.exports = { validateTransition };

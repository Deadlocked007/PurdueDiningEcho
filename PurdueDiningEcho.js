'use strict';

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
    outputSpeech: {
    type: 'PlainText',
    text: output,
    },
    card: {
    type: 'Simple',
    title: `SessionSpeechlet - ${title}`,
    content: `SessionSpeechlet - ${output}`,
    },
    reprompt: {
    outputSpeech: {
    type: 'PlainText',
    text: repromptText,
    },
    },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
    version: '1.0',
        sessionAttributes,
    response: speechletResponse,
    };
}

function getWelcomeResponse(callback) {
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to Purdue Dining Echo. ' +
    'Please tell me which dining court you need information on';
    const repromptText = 'Please tell me which dining court you need information on, ' +
    'your choices are Ford, Earhart, Hillenbrand, Wiley, or Windsor';
    const shouldEndSession = false;
    
    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);
    
    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

function createDiningCourtAttributes(diningCourt) {
    return {
        diningCourt,
    };
}

function diningCourtInfo(intent, session, callback) {
    const cardTitle = intent.name;
    const diningCourtSlot = intent.slots.DiningCourt;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = false;
    let speechOutput = '';
    
    const diningCourt = diningCourtSlot.value;
    sessionAttributes = createDiningCourt(diningCourt);
    speechOutput = 'What would you like to know about ${diningCourt}?';
    repromptText = 'What would you like to know about ${diningCourt}? You can ask me for information by saying things like, does ${diningCourt} have chicken today?';
    
    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    
}


function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);
    
    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;
    
    // Dispatch to your skill's intent handlers
    if (intentName === 'DiningCourtInfoIntent') {
        diningCourtInfo(intent, session, callback);
    } else {
        throw new Error('Invalid intent');
    }
}

function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);
        
        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
         if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
         callback('Invalid Application ID');
         }
         */
        
        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }
        
        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                     event.session,
                     (sessionAttributes, speechletResponse) => {
                     callback(null, buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                     event.session,
                     (sessionAttributes, speechletResponse) => {
                     callback(null, buildResponse(sessionAttributes, speechletResponse));
                     });
            
        } else if (event.request.type === 'SessionEndedRequest') {
        }
    } catch (err) {
        callback(err);
    }
};

import {
    // * App
    initializeApp,

    collection, 
    initializeFirestore,
    persistentLocalCache,
    CACHE_SIZE_UNLIMITED,
    onSnapshot,
    setDoc, doc,
    query, 

    // * Auth
    getAuth, onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut
}
from "./js/firebaseUtils.js"

//* grab() added to namespace from js/utils.js in index.html

//TODO Todo here

const firebaseConfig = {
    apiKey: "AIzaSyAyGmKK4Ln-eCJhKP1T-pNoSaCX2VxfiTM",
    authDomain: "unitodo-dca1b.firebaseapp.com",
    projectId: "unitodo-dca1b",
    storageBucket: "unitodo-dca1b.appspot.com",
    messagingSenderId: "611894646094",  
    appId: "1:611894646094:web:c88564df7afdfa806b3a1f"
};
const app = initializeApp(firebaseConfig);
let db

const inputElms =  [...grab('.login-element > input', "all")]

function switchToSignup(){

// * LogIn
    showBlock("login-container")

// * SignIn
    hide("signin-container")

// * SignUp
    showFlex("signup-container")

// * Content
    hide("content-container")
    hide("entries-content-container")
    hide("new-entry-container")

}
function switchToSignin(){
    
// * LogIn
    showBlock("login-container")

// * SignIn
    showFlex("signin-container")

// * SignUp
    hide("signup-container")

// * Content
    hide("content-container")
    hide("entries-content-container")
    hide("new-entry-container")

}
function switchToShowEntries(){

// * LogIn
    hide("login-container")
    
// * SignIn
    hide("signin-container")

// * SignUp
    hide("signup-container")

// * Content
    showFlex("content-container")
    showFlex("entries-content-container")
    hide("new-entry-container")
    
}
function switchToAddEntry(){

// * LogIn
    hide("login-container")
    
// * SignIn
    hide("signin-container")

// * SignUp
    hide("signup-container")

// * Content
    resetAddEntryInputs()
    showFlex("content-container")
    hide("entries-content-container")
    showFlex("new-entry-container")
}

    
function resetLoginInputs(){
        grab("signin-email-input").value = ""
        grab("signin-password-input").value = ""
        grab("signup-email-input").value = ""
        grab("signup-password-input").value = ""
        grab("signup-confirm-password-input").value = ""
        inputElms.forEach((inputElm) => {
            inputElm.classList.remove("login-input-clicked")
            inputElm.addEventListener("click", e => { e.target.classList.add("login-input-clicked") }, {once: true})
        })    
    }

function entryObjToEntryElement(entryObj){
    let entryElm = document.createElement("div")
    let entryName = entryObj.data().name
    let entrySubject = entryObj.data().subject
    let entryDesc = entryObj.data().desc
    
    entryElm.id = entryObj.id
    let entryDateCreated = new Date(entryObj.data().created.seconds * 1000)
    let entryDateDeadline = new Date(entryObj.data().duedate.seconds * 1000)
    let currDate = new Date()

    let progress = ((currDate.getTime() - entryDateCreated.getTime()) / (entryDateDeadline.getTime() - entryDateCreated.getTime()) ) * 100
    let check = true
    console.log(progress)
    if(progress <= 0 || progress >= 100){
        check = false
    }
    entryElm.classList.add("entry")

    let barElm = document.createElement("div")
    barElm.classList.add("bar")
    barElm.style.background = `linear-gradient(90deg, #B57994 ${progress}%, #714585ad ${progress}%)`
    barElm.innerHTML = "test"



    entryElm.innerHTML = ` 
        <div class="entry-title">
        ${entryName}
        </div>    
        <div class="entry-subject">
        ${entrySubject}
        </div>    
        <div class="entry-desc">
        ${entryDesc}
        `
    
    if(check){
        addTimer(entryDateDeadline, barElm)
        console.log("YES !")
    }
    entryElm.appendChild(barElm)
    return entryElm
}

function addTimer(endDate, elm){
    let x = setInterval(
        function(){
        let countDownDate = endDate.getTime()
        let now = new Date().getTime()
        let distance = countDownDate - now
        let days = Math.floor(distance / (1000 * 60 * 60 * 24))
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        let seconds = Math.floor((distance % (1000 * 60)) / 1000)
        
        elm.innerHTML = `${addZero(days)}d ${addZero(hours)}h ${addZero(minutes)}m ${addZero(seconds)}s`
        if (distance < 0) {
            clearInterval(x);
            elm.innerHTML = "";
            }
        },
    1000
    )
}
function addEntryToList(entryObj){
    let entryElm = entryObjToEntryElement(entryObj)
    grab("entries").append(entryElm)
}
async function signInUser(){

    let emailInput      = grab("signin-email-input").value
    let passwordInput   = grab("signin-password-input").value

    let errorsList = []

    if(!emailValid(emailInput)){        errorsList.push("Email invalid.") }
    if(emailInput == ""){               errorsList.push("Email cannot be empty.") }
    if(passwordInput == ""){            errorsList.push("Password cannot be empty.") }
    if(!passwordInput.length > 1000){   errorsList.push("Your passowrd does not need to be that long. cmon.") }

    if(errorsList.length == 0){
        await signInWithEmailAndPassword(auth, emailInput, passwordInput)
        .then((userCredential) => { 
            // ? Throws to signin-state observer
        })
        .catch((error) => { 
            errorsList.push(`Server: ${error.code.split("/")[1].replaceAll("-"," ")} `) 
        });   
    }
    
    if(errorsList.length > 0){
        grab("signin-error").style.display = "block" 
        grab("signin-error").innerHTML = ""
        errorsList.forEach((error) => { grab("signin-error").innerHTML += `# ${error} <br>` } ) 
    }  
}
async function createAndSignInUser(){

    let emailInput              = grab("signup-email-input").value
    let passwordInput           = grab("signup-password-input").value
    let confirmPasswordInput    = grab("signup-confirm-password-input").value

    let errorsList = []

    if(!emailValid(emailInput)){                errorsList.push("Email invalid.") }
    if(emailInput == ""){                       errorsList.push("Email cannot be empty.") }
    if(passwordInput == ""){                    errorsList.push("Password cannot be empty.") }
    if(passwordInput != confirmPasswordInput){  errorsList.push("Passwords do not match.") }
    if(!passwordInput.length > 1000){           errorsList.push("Your password does not need to be that long. cmon.") }

    if(errorsList.length == 0){
        await createUserWithEmailAndPassword(auth, emailInput, confirmPasswordInput)
        .then((userCredential) => {
            // ? Throws to observer
        })
        .catch((error) => {
            errorsList.push(`Server: ${error.code.split("/")[1].replaceAll("-"," ")} `) 
        });        
    }

    if(errorsList.length > 0){
        grab("signup-error").style.display = "block" 
        grab("signup-error").innerHTML = ""
        errorsList.forEach((error) => { grab("signin-error").innerHTML += `# ${error} <br>` } ) 
    }
}
function signOutUser(){
    signOut(auth).then(() => {
        // ? Throws to observer
    }).catch((error) => {
        let errorMessage = error.code.split("/")[1].replaceAll("-"," ")
        console.log(errorMessage)
        // TODO Handle error, retry 
    });
}

function addEventListenersToSignin(){
        // ? Signin buttons
        grab("signin-button").addEventListener("click", signInUser)
        grab("signup-redirect-button").addEventListener("click", switchToSignup)
    
    // ? Signup buttons
        grab("signup-button").addEventListener("click", createAndSignInUser)
        grab("signin-redirect-button").addEventListener("click", switchToSignin)
    
    // ? Signout button
        grab("logout-button").addEventListener("click", signOutUser)
        
}   

addEventListenersToSignin()

// * Page load

var userId = ""
const auth = getAuth();
grab("loading").style.display = "none"
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("show content and hide signin", user.uid)
        userId = user.uid
        // TODO PLAN
        // * Only get a certain amt of entries and udate as user scrolls (less reads)
        // * Do the whole local cache and offline persistence thing isjk 

        switchToShowEntries()
        var lastId = "0"
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                cacheSizeBytes:CACHE_SIZE_UNLIMITED
            })
        })
        onSnapshot(
            query(collection(db, `users/${userId}/todos`)), { includeMetadataChanges: true }, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    const source = snapshot.metadata.fromCache ? "local cache" : "server";
                    console.log("snapshotted")
                    if(change.type === "added"){
                        addEntryToList(change.doc)      
                        console.log("added:",change.doc.id,change.doc.data(), "from", source) 
                    }
                    if(change.type === "modified"){
                        console.log("modified:",change.doc.data(), "from", source)
                    }
                    if(change.type === "removed"){
                        console.log("removed:",change.doc.data(), "from", source)
                    }
                    lastId = change.doc.id
                })
            }
        )
    }
    else {
        console.log("hide content and show signin")
        userId = ""
        db = ""

        resetLoginInputs()
        switchToSignin()

        // ? lets say someone logs in on an account at a library, how to make the logout button remove the data from lets say the cookies
    }
})

function addEventListeners(){

}

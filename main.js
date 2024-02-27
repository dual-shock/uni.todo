import {
    // * App
    initializeApp,

    collection, 
    initializeFirestore,
    persistentLocalCache,
    CACHE_SIZE_UNLIMITED,
    onSnapshot, deleteDoc, updateDoc,
    setDoc, doc, addDoc, Timestamp,
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
let categoryElms = document.querySelectorAll(".category")
let subjects = []
categoryElms.forEach((elm) => {
    subjects.push(elm.innerHTML)
})
function addSubjectToBar(subjectName){
    if(subjects.includes(subjectName)){
        return
    }
    else{
        let categoryElm = document.createElement("div")
        categoryElm.className = "category"
        categoryElm.innerHTML = subjectName
        categoryElm.addEventListener("click", e => {
            let selected = grab("selected-category","class")
            if(selected.length !== 0){
                selected[0].classList.remove("selected-category")
            }
            //FILTER ENTRIES
            e.target.classList.add("selected-category")
        })
        grab("new-entry-row").append(categoryElm)
        
        let entriesCategoryElm = document.createElement("div")
        entriesCategoryElm.className = "category"
        entriesCategoryElm.innerHTML = subjectName
        entriesCategoryElm.addEventListener("click",e => {
            let selected = grab("selected-category","class")
            if(selected.length !== 0){
                selected[0].classList.remove("selected-category")
            }

            e.target.classList.add("selected-category")
            filterEntries()
        })
        grab("entries-row").append(entriesCategoryElm)
    
        subjects.push(subjectName)
    }
}
function resetAddEntryInputs(){
    let startDate = new Date()
    grab("start-time-input").value = `${startDate.getFullYear()}-${addZero(startDate.getMonth()+1)}-${addZero(startDate.getDate())}T${addZero(startDate.getHours())}:${addZero(startDate.getMinutes())}:${addZero(startDate.getSeconds())}`
    let endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)
    grab("end-time-input").value = `${endDate.getFullYear()}-${addZero(endDate.getMonth()+1)}-${addZero(endDate.getDate())}T${addZero(endDate.getHours())}:${addZero(endDate.getMinutes())}:${addZero(endDate.getSeconds())}`
    grab("name-input").value = ""
    grab("desc-input").value = ""
    grab("new-category-button").children[0].placeholder = "+ New"
    grab("new-category-button").children[0].value = ""
    let selected = grab("selected-category","class")
    if(selected.length !== 0){
        selected[0].classList.remove("selected-category")
    }

}   
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
async function addNewEntry(){
    let startTimeInput = grab("start-time-input").value
    let endTimeInput = grab("end-time-input").value
    let nameInput = grab("name-input").value
    let descInput = grab("desc-input").value
    let selectedNewEntryCategory = document.querySelectorAll("#new-entry-row > .selected-category")
    let categoryInput = ""
    if(selectedNewEntryCategory.length !== 0){
        if(selectedNewEntryCategory[0].id == "new-category-button"){
            categoryInput = selectedNewEntryCategory[0].children[0].value
            
        }
        else{
            categoryInput = selectedNewEntryCategory[0].innerHTML
        }
    }
    console.log(categoryInput)
    let valid = true
    if(categoryInput == ""){
        grab("new-category-button").children[0].placeholder = "No cat. !"
        valid = false
        console.log("invalid category?")
    }
    
    if(nameInput == ""){
        console.log("invalid name?")
        grab("name-input").placeholder = "Name cant be empty !"
        valid = false
    }
    console.log("test that t comes here")
    // if(new Date(startTimeInput).getTime() > new Date(endTimeInput).getTime() / 1000){
    //     valid = false
    //     grab("add-button").innerHTML = "Dates error!"
    //     await sleep(3000)
    //     grab("add-button").innerHTML = "Add"
    // }

    if(valid === true){
        console.log("reaches here?")
        try{
            let docRef = addDoc( collection(db, `users/${userId}/todos`), {
                created: new Timestamp(Math.round(new Date(startTimeInput).getTime() / 1000), 499999999),
                duedate: new Timestamp(Math.round(new Date(endTimeInput).getTime() / 1000), 499999999),
                desc: descInput,
                name: nameInput,
                subject: categoryInput
            })
            switchToShowEntries()
        }
        catch(e){
            console.log(e)
        }
        
    }    
}
async function removeEntry(id){
    grab(`${id}Parent`).dataset.finished = "true"
    let descElm = grab(`${id}Parent`).children[2]
    let deleteButton = descElm.children[1]
    deleteButton.remove()
    grab(`${id}Parent`).classList.add("finished-entry")
    grab("finished").appendChild( grab(`${id}Parent`) )
    let finishedBarElm = grab(`${id}Parent`).children[3]

    await sleep(1000)
    finishedBarElm.style.background = `linear-gradient(90deg, #B57994 100%, #714585ad 100%)`
    finishedBarElm.innerHTML = "00D 00H 00M 00S"

}
function entryObjToEntryElement(entryObj){
    let entryElm = document.createElement("div")
    let entryName = entryObj.data().name
    let entrySubject = entryObj.data().subject
    let entryDesc = entryObj.data().desc
    entryElm.id = `${entryObj.id}Parent`
    let entryDateCreated = new Date(entryObj.data().created.seconds * 1000)
    let entryDateDeadline = new Date(entryObj.data().duedate.seconds * 1000)
    let currDate = new Date()

    let progress = ((currDate.getTime() - entryDateCreated.getTime()) / (entryDateDeadline.getTime() - entryDateCreated.getTime()) ) * 100
    let check = true
    if(progress <= 0 || progress >= 100){
        check = false
    }
    let timeLeft = entryDateDeadline.getTime() - currDate.getTime()
    entryElm.dataset.progress = progress
    entryElm.dataset.timeLeft = timeLeft
    entryElm.classList.add("entry")

    let barElm = document.createElement("div")
    barElm.classList.add("bar")
    barElm.style.background = `linear-gradient(90deg, #B57994 ${progress}%, #714585ad ${progress}%)`
    barElm.innerHTML = "00d 00h 00m 00s"

    
    addSubjectToBar(entrySubject)
    if(entryDesc == ""){entryDesc = "No desc."}
    entryElm.innerHTML = ` 
        <div class="entry-title">
            ${entryName}
        </div>    
        <div class="entry-subject">
            ${entrySubject}
        </div>    

        `
    let descElm = document.createElement("div")
    descElm.classList.add("entry-desc")
    let descText = document.createElement("div")
    descText.classList.add("entry-desc-text")
    descText.innerHTML = entryDesc

    let deleteButton = document.createElement("div")
    deleteButton.classList.add("entry-delete")
    deleteButton.innerHTML = "Mark done"
    deleteButton.addEventListener("click", e => {
        try{
            docRef = updateDoc(doc(db, `users/${userId}/todos`, entryObj.id), {
                duedate: new Timestamp(Math.round(new Date().getTime() / 1000) - 10, 499999999),
            })
        }
        catch(e){
            console.log(e)
        }
    })
    descElm.appendChild(descText)

    descElm.appendChild(deleteButton)


    if(check){
        addTimer(entryDateCreated, entryDateDeadline, barElm)
    }
    entryElm.appendChild(descElm)
    entryElm.appendChild(barElm)
    return {
        "elm":entryElm,
        "timeLeft":timeLeft
    }
}

function addTimer(startDate, endDate, elm){
    let x = setInterval(
        function(){
            let currDate = new Date().getTime()
            let progress = ((currDate - startDate.getTime()) / (endDate.getTime() - startDate.getTime()) ) * 100
            elm.style.background = `linear-gradient(90deg, #B57994 ${progress}%, #714585ad ${progress}%)`
            let countDownDate = endDate.getTime()
            
            let distance = countDownDate - currDate
            let days = Math.floor(distance / (1000 * 60 * 60 * 24))
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            let seconds = Math.floor((distance % (1000 * 60)) / 1000)
            
            elm.innerHTML = `${addZero(days)}d ${addZero(hours)}h ${addZero(minutes)}m ${addZero(seconds)}s`
            
            if (distance <= 0 || elm.parentElement.dataset.finished == "true" || elm.parentElement.dataset.finished == "true") {
                clearInterval(x);
                removeEntry(elm.parentElement.id.replace("Parent",""))
            }
        },
    1000
    )
}

function addEntryToList(entryObj){
    let entry = entryObjToEntryElement(entryObj)
    if(entry.elm.dataset.progress <= 0 || entry.elm.dataset.progress >= 100){
        grab("ongoing").prepend(entry.elm)
        removeEntry(entry.elm.id.replace("Parent",""))
        return
    }
    let entriesNodeList = document.querySelectorAll("#ongoing > div")
    let added = false
    if(entriesNodeList != null){
        for(let elm of entriesNodeList){
            if(entry.timeLeft < Number(elm.dataset.timeLeft)){
                grab("ongoing").insertBefore(entry.elm, elm)
                added = true
                break
            } 
        }
        if(!added){
            grab("ongoing").appendChild(entry.elm)
        }
    } 
    else{
        grab("ongoing").appendChild(entry.elm)
    }
}


function filterEntries(){
    
    if(document.querySelectorAll(".selected-category").length){
        let selectedSubjectElm = document.querySelectorAll(".selected-category")[0]
        let selectedSubject = selectedSubjectElm.innerHTML
    
        let activeEntries = grab("ongoing").children
    
        if(activeEntries.length){
            for(let entry of activeEntries){
                if(entry.children[1].innerHTML.trim() === selectedSubject){
                    if(entry.classList.contains("entry-hide")){
                        entry.classList.remove("entry-hide")
                    }
                }
                else{
                    entry.classList.add("entry-hide")
                }
            }        
        }
    }
    else{
        let hiddenElms =document.querySelectorAll(".entry-hide") 
        if(hiddenElms.length){
            hiddenElms.forEach((elm) => {
                elm.classList.remove("entry-hide")
            }
            )
        }
    }
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
                    console.log("- snapshot")
                    if(change.type === "added"){
                        addEntryToList(change.doc)      
                        console.log("added:",change.doc.id,change.doc.data(), "from", source) 
                    }
                    if(change.type === "modified"){
                        console.log("modified:",change.doc.data(), "from", source)
                        removeEntry(change.doc.id)
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
    // ? Content buttons
        grab("add-new-button").addEventListener("click",switchToAddEntry)      
  
    // ? Add entry buttons
        grab("cancel-button").addEventListener("click", switchToShowEntries)
        grab("add-button").addEventListener("click", addNewEntry)
        grab("new-category-button").addEventListener("click", e => {
            let selected = grab("selected-category","class")
            if(selected.length !== 0){
                selected[0].classList.remove("selected-category")
            }
            console.log("reaches listener")
            console.log(grab("new-category-button").classList)
            grab("new-category-button").classList.add("selected-category")
            console.log(grab("new-category-button").classList)
            console.log(grab("new-category-button"))
        } 
        
        )

    // ? Click handler / deselecter
        grab("content-container").addEventListener("click", e => {
            if(!e.target.classList.contains("category")){
                let selectedCatElms = document.querySelectorAll(".selected-category") 
                if(selectedCatElms.length){
                    selectedCatElms[0].classList.remove("selected-category")
                }
                filterEntries()
            }
        })
}
addEventListeners()
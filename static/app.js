class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            maximizeButton: document.getElementById('maximizeButton'), // New maximize button reference
            downloadButton: document.getElementById('downloadButton'), // New download button reference
            settingsButton: document.getElementById('settingsButton'), // New settings button reference
            attachmentButton: document.getElementById('attachButton'),
            dropdownContent: document.getElementById('dropdownContent') // New dropdown content reference
        }

        this.state = false;
        this.messages = [];
        this.dropdownVisible = false; // Track whether dropdown is visible
    }

    display() {
        const { openButton, chatBox, sendButton, settingsButton, dropdownContent, maximizeButton, downloadButton } = this.args;
    
        openButton.addEventListener('click', () => this.toggleState(chatBox));
        sendButton.addEventListener('click', () => this.onSendButton(chatBox));
    
        // Change event listener to listen for click instead of hover
        settingsButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the click event from bubbling up to the document
            this.toggleDropdown(dropdownContent);
        });
        maximizeButton.addEventListener('click', () => this.maximizeChatbox()); // No need to pass arguments

        downloadButton.addEventListener('click', () => this.downloadChatHistory());
        attachButton.addEventListener('change', (event) => this.handleAttachment(event));
    
        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });
    }
    
    toggleState(chatbox) {
        this.state = !this.state;

        // show or hide the box
        if (this.state) {
            chatbox.classList.add('chatbox--active');
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value;
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 };
        this.messages.push(msg1);

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(r => r.json())
            .then(r => {
                let msg2 = { name: "Pendo", message: r.answer };
                this.messages.push(msg2);
                this.updateChatText(chatbox);
                textField.value = '';
            }).catch((error) => {
                console.error('Error:', error);
                this.updateChatText(chatbox);
                textField.value = '';
            });
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function (item) {
            if (item.name === "Pendo") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>';
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }

    toggleDropdown(dropdownContent) {
        if (this.dropdownVisible) {
            dropdownContent.classList.remove('show'); // Hide dropdown if it's visible
        } else {
            dropdownContent.classList.add('show'); // Show dropdown if it's hidden
        }
        this.dropdownVisible = !this.dropdownVisible; // Toggle dropdown visibility state
    }
    maximizeChatbox() {
            if (chatbotContainer.requestFullscreen) {
                chatbotContainer.requestFullscreen();
            } else if (chatbotContainer.mozRequestFullScreen) { /* Firefox */
                chatbotContainer.mozRequestFullScreen();
            } else if (chatbotContainer.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                chatbotContainer.webkitRequestFullscreen();
            } else if (chatbotContainer.msRequestFullscreen) { /* IE/Edge */
                chatbotContainer.msRequestFullscreen();
            }
        }

        handleAttachment(event) {
            console.log('attach button clicked');
            const files = event.target.files;
            // Process the selected files
            console.log(files);
        }
    

    downloadChatHistory() {
        // Functionality to download chat history
        console.log('download button clicked');
         // Prepare chat history data
         const chatHistory = this.messages.map(msg => `${msg.name}: ${msg.message}`).join('\n');
        
         // Create a Blob containing the chat history text
         const blob = new Blob([chatHistory], { type: 'text/plain' });
 
         // Create a link element
         const link = document.createElement('a');
         link.href = URL.createObjectURL(blob);
         link.download = 'chat_history.txt'; // Set filename
 
         // Trigger a click event on the link to prompt download
         link.click();
    }
}

const chatbox = new Chatbox();
chatbox.display();

// Close dropdown when user clicks outside of it
window.addEventListener('click', function (event) {
    const dropdownContent = document.getElementById('dropdownContent');
    if (!event.target.matches('.settings-button')) {
        dropdownContent.classList.remove('show'); // Hide dropdown
        chatbox.dropdownVisible = false; // Update dropdown visibility state
    }
});
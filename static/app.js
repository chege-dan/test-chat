class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            settingsButton: document.getElementById('settingsButton'),
            dropdownContent: document.getElementById('dropdownContent'),
            maximizeButton: document.getElementById('maximizeButton'),
            downloadButton: document.getElementById('downloadButton')
        }

        this.state = false;
        this.messages = [];
        this.dropdownVisible = false;
    }

    display() {
        const { openButton, chatBox, sendButton, settingsButton, dropdownContent, maximizeButton, downloadButton } = this.args;
    
        openButton.addEventListener('click', () => this.toggleState(chatBox));
        sendButton.addEventListener('click', () => this.onSendButton(chatBox));
    
        settingsButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.toggleDropdown(dropdownContent);
        });

        maximizeButton.addEventListener('click', () => this.maximizeChatbox());
        downloadButton.addEventListener('click', () => this.downloadChatHistory());
    
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
            const node = chatbox.querySelector('input');
        node.focus();
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
                let msg2 = { name: "Omosh", message: r.answer };
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
            if (item.name === "Omosh") {
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
            dropdownContent.classList.remove('show');
        } else {
            dropdownContent.classList.add('show');
        }
        this.dropdownVisible = !this.dropdownVisible;
    }

    maximizeChatbox() {
        // Functionality to maximize chatbox
        console.log('maximize button clicked');
    }

    downloadChatHistory() {
        // Functionality to download chat history
        console.log('download button clicked');
    }
}

const chatbox = new Chatbox();
chatbox.display();

window.addEventListener('click', function (event) {
    const dropdownContent = document.getElementById('dropdownContent');
    if (!event.target.matches('.settings-button')) {
        dropdownContent.classList.remove('show');
        chatbox.dropdownVisible = false;
    }
});

// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- General Elements ---
    const bodyElement = document.body;
    const contentToRead = document.getElementById('main-content');
    const accessibilityControls = document.getElementById('accessibility-controls');

    // --- Header Collapsible Navigation ---
    const headerToggleBtn = document.getElementById('header-toggle-btn');
    const mainNav = document.getElementById('main-nav');

    if (headerToggleBtn && mainNav) {
        const setupNav = () => {
            if (headerToggleBtn.getAttribute('aria-expanded') === 'true') {
                const initialTransition = mainNav.style.transition;
                mainNav.style.transition = 'none'; 
                mainNav.style.maxHeight = mainNav.scrollHeight + 'px';
                mainNav.classList.remove('nav-collapsed');
                void mainNav.offsetHeight;
                mainNav.style.transition = initialTransition; 
            } else {
                mainNav.classList.add('nav-collapsed'); 
            }
        };
        setupNav();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (!mainNav.classList.contains('nav-collapsed') && mainNav.style.maxHeight !== '0px') {
                    mainNav.style.maxHeight = mainNav.scrollHeight + 'px';
                }
            }, 100);
        });

        headerToggleBtn.addEventListener('click', () => {
            const isCurrentlyCollapsed = mainNav.classList.contains('nav-collapsed');
            if (isCurrentlyCollapsed) { 
                mainNav.classList.remove('nav-collapsed');
                mainNav.style.maxHeight = mainNav.scrollHeight + 'px';
                headerToggleBtn.setAttribute('aria-expanded', 'true');
            } else { 
                mainNav.style.maxHeight = mainNav.scrollHeight + 'px';
                headerToggleBtn.setAttribute('aria-expanded', 'false'); 
                requestAnimationFrame(() => {
                    mainNav.classList.add('nav-collapsed');
                });
            }
        });
    }

    // --- Font Size Adjustment ---
    const increaseFontBtn = document.getElementById('increase-font');
    const decreaseFontBtn = document.getElementById('decrease-font');
    let currentFontSize = parseFloat(window.getComputedStyle(bodyElement, null).getPropertyValue('font-size'));
    const minFontSize = 12; 
    const maxFontSize = 24; 
    const fontSizeStep = 1; 

    if (increaseFontBtn && decreaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => {
            if (currentFontSize < maxFontSize) {
                currentFontSize += fontSizeStep;
                bodyElement.style.fontSize = currentFontSize + 'px';
                updateFontButtonStates();
            }
        });
        decreaseFontBtn.addEventListener('click', () => {
            if (currentFontSize > minFontSize) {
                currentFontSize -= fontSizeStep;
                bodyElement.style.fontSize = currentFontSize + 'px';
                updateFontButtonStates();
            }
        });
        function updateFontButtonStates() {
            decreaseFontBtn.disabled = currentFontSize <= minFontSize;
            increaseFontBtn.disabled = currentFontSize >= maxFontSize;
        }
        updateFontButtonStates();
    }

    // --- Font Family Selection ---
    const fontFamilySelect = document.getElementById('font-family-select');
    const fontOptions = [
        { name: "Roboto (Default)", value: "'Roboto', Arial, Helvetica, sans-serif" },
        { name: "Arial", value: "Arial, Helvetica, sans-serif" },
        { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
        { name: "Georgia", value: "Georgia, serif" },
        { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
        { name: "Courier New", value: "'Courier New', Courier, monospace" }
    ];

    if (fontFamilySelect) {
        fontOptions.forEach(font => {
            const option = document.createElement('option');
            option.value = font.value;
            option.textContent = font.name;
            fontFamilySelect.appendChild(option);
        });
        fontFamilySelect.value = fontOptions[0].value; 
        bodyElement.style.fontFamily = fontOptions[0].value;
        fontFamilySelect.addEventListener('change', (event) => {
            bodyElement.style.fontFamily = event.target.value;
        });
    }

    // --- Text-to-Speech (TTS) ---
    const speakContentBtn = document.getElementById('speak-content');
    const stopSpeakBtn = document.getElementById('stop-speak');
    const synth = window.speechSynthesis;
    let ttsUtterance = null;
    const voiceSelect = document.createElement('select');
    voiceSelect.id = 'voice-select';
    const voiceLabel = document.createElement('label');
    voiceLabel.textContent = 'Choose Voice: ';
    voiceLabel.setAttribute('for', 'voice-select');
    const ttsControlGroup = document.querySelector('#accessibility-controls .control-group:has(#speak-content)');

    if (ttsControlGroup) {
        if (!document.getElementById('voice-select')) { 
            const br = document.createElement('br');
            const referenceNode = stopSpeakBtn || speakContentBtn; 
            if (referenceNode) {
                referenceNode.insertAdjacentElement('afterend', voiceSelect);
                referenceNode.insertAdjacentElement('afterend', voiceLabel);
                referenceNode.insertAdjacentElement('afterend', br);
            } else { 
                ttsControlGroup.appendChild(br);
                ttsControlGroup.appendChild(voiceLabel);
                ttsControlGroup.appendChild(voiceSelect);
            }
        }
    } else {
        console.warn("TTS control group for voice selection not found.");
    }

    let voices = [];
    function populateVoices() {
        voices = synth.getVoices();
        voiceSelect.innerHTML = ''; 
        if (voices.length === 0 && synth.onvoiceschanged === null) {
             console.warn("No voices available. TTS might not work or voices haven't loaded yet.");
        }
        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})${voice.default ? ' — Default' : ''}`;
            voiceSelect.appendChild(option);
        });
        const defaultVoice = voices.find(voice => voice.default);
        if (defaultVoice) {
            voiceSelect.value = voices.indexOf(defaultVoice);
        } else if (voices.length > 0) {
            voiceSelect.value = 0; 
        }
    }

    if (!('speechSynthesis' in window) || !speakContentBtn || !stopSpeakBtn) {
        console.warn("Speech Synthesis not supported or TTS buttons not found.");
        if(speakContentBtn) speakContentBtn.disabled = true;
        if(stopSpeakBtn) stopSpeakBtn.disabled = true;
        if(voiceSelect.parentElement) voiceSelect.parentElement.removeChild(voiceSelect);
        if(voiceLabel.parentElement) voiceLabel.parentElement.removeChild(voiceLabel);
        if (accessibilityControls && speakContentBtn && speakContentBtn.parentElement) {
             const message = document.createElement('p');
             message.textContent = 'Text-to-speech is not supported in your browser.';
             message.style.fontSize = '0.8em';
             message.style.color = '#ffdddd'; 
             speakContentBtn.parentElement.appendChild(message);
        }
    } else {
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = populateVoices;
        } else {
            populateVoices(); 
        }
        speakContentBtn.addEventListener('click', () => {
            if (synth.speaking) synth.cancel(); 
            if (contentToRead) {
                let textToSpeak = "";
                const mainContentSections = contentToRead.querySelectorAll('section');
                if (mainContentSections.length > 0) {
                    mainContentSections.forEach(section => {
                        const heading = section.querySelector('h2');
                        if (heading) textToSpeak += heading.textContent + ". ";
                        const elementsToRead = section.querySelectorAll('p, li'); 
                        elementsToRead.forEach(el => textToSpeak += el.textContent + ". ");
                        textToSpeak += "\n"; 
                    });
                } else {
                     textToSpeak = contentToRead.innerText || contentToRead.textContent || "";
                }
                ttsUtterance = new SpeechSynthesisUtterance(textToSpeak.replace(/\s+/g, ' ').trim());
                const selectedVoiceIndex = voiceSelect.value;
                if (voices[selectedVoiceIndex]) ttsUtterance.voice = voices[selectedVoiceIndex];
                ttsUtterance.onerror = (event) => {
                    console.error('SpeechSynthesisUtterance.onerror', event);
                    speakContentBtn.disabled = false; stopSpeakBtn.disabled = true;
                };
                ttsUtterance.onend = () => { speakContentBtn.disabled = false; stopSpeakBtn.disabled = true; };
                ttsUtterance.onstart = () => { speakContentBtn.disabled = true; stopSpeakBtn.disabled = false; };
                synth.speak(ttsUtterance);
            } else {
                console.error("Main content area #main-content not found for speech.");
            }
        });
        stopSpeakBtn.addEventListener('click', () => { if (synth.speaking) synth.cancel(); });
        stopSpeakBtn.disabled = true; 
        window.addEventListener('beforeunload', () => { if (synth.speaking) synth.cancel(); });
    }

    // --- Collapsible Keyboard Help Section ---
    const keyboardHelpToggleBtn = document.getElementById('keyboard-help-toggle');
    const keyboardHelpContent = document.getElementById('keyboard-help-content');

    if (keyboardHelpToggleBtn && keyboardHelpContent) {
        const isInitiallyExpanded = keyboardHelpToggleBtn.getAttribute('aria-expanded') === 'true';
        if (!isInitiallyExpanded) {
            keyboardHelpContent.classList.add('collapsed');
        } else {
            keyboardHelpContent.style.maxHeight = keyboardHelpContent.scrollHeight + 'px';
        }

        keyboardHelpToggleBtn.addEventListener('click', () => {
            const isExpanded = keyboardHelpToggleBtn.getAttribute('aria-expanded') === 'true';
            if (isExpanded) { // Collapse action
                keyboardHelpToggleBtn.setAttribute('aria-expanded', 'false');
                keyboardHelpContent.style.maxHeight = keyboardHelpContent.scrollHeight + 'px'; 
                requestAnimationFrame(() => {
                    keyboardHelpContent.classList.add('collapsed');
                });
            } else { // Expand action
                keyboardHelpToggleBtn.setAttribute('aria-expanded', 'true');
                keyboardHelpContent.classList.remove('collapsed');
                keyboardHelpContent.style.maxHeight = keyboardHelpContent.scrollHeight + 'px';
                
                keyboardHelpContent.addEventListener('transitionend', function onTransitionEnd(event) {
                    if (event.propertyName === 'max-height' && keyboardHelpToggleBtn.getAttribute('aria-expanded') === 'true') {
                        // keyboardHelpContent.style.maxHeight = 'none'; 
                    }
                }, { once: true });
            }
        });
        
        let keyboardHelpResizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(keyboardHelpResizeTimeout);
            keyboardHelpResizeTimeout = setTimeout(() => {
                if (keyboardHelpToggleBtn.getAttribute('aria-expanded') === 'true' && !keyboardHelpContent.classList.contains('collapsed')) {
                    keyboardHelpContent.style.maxHeight = keyboardHelpContent.scrollHeight + 'px';
                }
            }, 100);
        });
    } 


    // --- Main Navigation Keyboard Support ---
    const mainNavElement = document.getElementById('main-nav'); 
    if (mainNavElement) {
        const navLinks = Array.from(mainNavElement.querySelectorAll('ul li a'));
        if (navLinks.length > 0) {
            navLinks.forEach((link, index) => {
                link.addEventListener('click', (event) => {
                    const targetId = link.getAttribute('href');
                    if (targetId && targetId.startsWith('#') && targetId.includes('index.html#')) { // Only for same-page links on index
                        const sectionId = targetId.substring(targetId.indexOf('#') + 1);
                        const sectionElement = document.getElementById(sectionId);
                        if (sectionElement) {
                            const heading = sectionElement.querySelector('h2');
                            if (heading && heading.hasAttribute('tabindex')) {
                                requestAnimationFrame(() => { heading.focus({ preventScroll: true }); });
                            }
                        }
                    }
                    if (headerToggleBtn && headerToggleBtn.getAttribute('aria-expanded') === 'true') {
                         if (window.innerWidth <= 768) { 
                            headerToggleBtn.click();
                         }
                    }
                });
                link.addEventListener('keydown', (event) => {
                    let nextIndex;
                    const isLtr = getComputedStyle(mainNavElement).direction !== 'rtl';
                    const rightArrow = isLtr ? 'ArrowRight' : 'ArrowLeft';
                    const leftArrow = isLtr ? 'ArrowLeft' : 'ArrowRight';
                    if (event.key === rightArrow || event.key === 'ArrowDown') {
                        event.preventDefault(); nextIndex = (index + 1) % navLinks.length; navLinks[nextIndex].focus();
                    } else if (event.key === leftArrow || event.key === 'ArrowUp') {
                        event.preventDefault(); nextIndex = (index - 1 + navLinks.length) % navLinks.length; navLinks[nextIndex].focus();
                    } else if (event.key === 'Home') {
                        event.preventDefault(); navLinks[0].focus();
                    } else if (event.key === 'End') {
                        event.preventDefault(); navLinks[navLinks.length - 1].focus();
                    } else if (event.key === ' ' || event.key === 'Enter') { // Added Enter for consistency
                        event.preventDefault(); link.click();
                    }
                    if (event.key === 'Escape' && headerToggleBtn && headerToggleBtn.getAttribute('aria-expanded') === 'true') {
                        event.preventDefault(); headerToggleBtn.click(); headerToggleBtn.focus(); 
                    }
                });
            });
        }
    } 
});
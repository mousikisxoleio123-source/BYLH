document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    let currentClass = '';
    
    // ΚΑΘΟΛΙΚΗ ΛΙΣΤΑ ΤΑΞΕΩΝ (ΠΡΟΣΘΗΚΗ ΝΗΠΙΑΓΩΓΕΙΟΥ)
    const allClasses = ['Νηπιαγωγείο', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'ΣΤ'];
    
    // ΠΑΓΚΟΣΜΙΑ ΜΕΤΑΒΛΗΤΕΣ ΓΙΑ ΑΝΤΙΓΡΑΦΗ/ΕΠΙΚΟΛΛΗΣΗ
    let copiedContentItem = localStorage.getItem('copiedContentItem') || ''; 
    let copiedContentData = localStorage.getItem('copiedContentData') || ''; 
    
    // Initialization with an empty object, or a predefined structure if localStorage is empty
    let data = {};
    try {
        data = JSON.parse(localStorage.getItem('bookOfMatterData')) || {};
    } catch (e) {
        console.error("Failed to parse data from localStorage, initializing new data.", e);
    }

    // ΠΡΟΣΘΗΚΗ: Δημιουργία δομής για το Νηπιαγωγείο αν δεν υπάρχει
    allClasses.forEach(c => {
        if (!data[c]) data[c] = [];
    });
    
    function saveData() {
        localStorage.setItem('bookOfMatterData', JSON.stringify(data));
        localStorage.setItem('copiedContentItem', copiedContentItem); 
        localStorage.setItem('copiedContentData', copiedContentData);
    }

    function formatDateForDisplay(dateString) {
        if (!dateString) return '';
        const dateObj = new Date(dateString + 'T00:00:00');
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return dateObj.toLocaleDateString('el-GR', options);
    }
    
    function formatSimpleDate(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // ΕΝΗΜΕΡΩΣΗ: Προστέθηκαν τα νέα items 'Όργανα' και 'Δραστηριότητα' με υπάρχοντα εικονίδια
    const imageMap = {
        'Βιβλίο': 'vivlio.png',
        'Τετράδιο εργασιών': 'tetradioergasiwn.png',
        'Πεντάγραμμο': 'pentagrammo.png',
        'Μεταλλόφωνο': 'Metallofwno.png',
        'Όργανα': 'Metallofwno.png', // Νέο: Χρήση του ίδιου εικονιδίου
        'Τραγούδι': 'tragoudi.png',
        'Google Παρουσιάσεις': 'googleparousiaseis.png',
        'Εφαρμογή': 'Efarmogi.png',
        'Δραστηριότητα': 'Efarmogi.png', // Νέο: Χρήση του ίδιου εικονιδίου
        'Φύλλο εργασίας': 'fylloergasias.png',
        'Παιχνίδι': 'paixnidi.png'
    };
    
    // ΛΙΣΤΕΣ ΔΡΑΣΤΗΡΙΟΤΗΤΩΝ
    const primaryContentItems = ['Βιβλίο', 'Τετράδιο εργασιών', 'Πεντάγραμμο', 'Μεταλλόφωνο', 'Τραγούδι', 'Google Παρουσιάσεις', 'Εφαρμογή', 'Φύλλο εργασίας', 'Παιχνίδι'];
    const kindergartenContentItems = ['Όργανα', 'Τραγούδι', 'Google Παρουσιάσεις', 'Δραστηριότητα', 'Παιχνίδι'];

    function renderHomeView() {
        appContainer.innerHTML = `
            <div class="card">
                <h2>Γενικά Στοιχεία</h2>
                <p>Σχολικό Έτος: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</p>
                <p>Επιλέξτε μια τάξη για να δείτε ή να προσθέσετε ύλη.</p>
                <div class="class-grid">
                    ${allClasses.map(c => { // Χρήση της νέας λίστας allClasses
                        // Καθορισμός ασφαλούς ονόματος για CSS class
                        const safeClass = c === 'Νηπιαγωγείο' ? 'nipiagogeio' : c.toLowerCase();
                        const lessons = data[c] ? data[c].filter(l => l.date && l.lessonTitle) : [];
                        lessons.sort((a, b) => new Date(b.date) - new Date(a.date));
                        const lastLessonHtml = lessons.length > 0 ? `
                            <div class="last-lesson-info">
                                <p><strong>Τελευταίο μάθημα:</strong></p>
                                <p><strong>${formatSimpleDate(lessons[0].date)}:</strong> ${lessons[0].lessonTitle}</p>
                            </div>
                        ` : '';
                        
                        // ΑΛΛΑΓΗ: Εμφάνιση μόνο 'Νηπιαγωγείο' ή 'Τάξη X'
                        const cardTitle = c === 'Νηπιαγωγείο' ? c : `Τάξη ${c}`;

                        return `
                            <div class="class-card-container">
                                <div class="class-card class-card-${safeClass}" data-class="${c}">
                                    <h3>${cardTitle}</h3>
                                </div>
                                ${lastLessonHtml}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            <div class="card actions">
                <a href="https://classroom.google.com/u/1/h" target="_blank">
                    <button class="button">Google Classroom</button>
                </a>
                <a href="https://ebooks.edu.gr/ebooks/v2/allcourses.jsp" target="_blank">
                    <button class="button">Βιβλία</button>
                </a>
                <input type="file" id="import-txt" accept=".txt" style="display:none;">
                <button id="import-button" class="button">Εισαγωγή από TXT</button>
                <button id="export-txt" class="button">Εξαγωγή σε Αρχείο TXT</button>
            </div>
        `;
    }

    function renderClassView(className) {
        currentClass = className;
        const lessons = data[className].filter(lesson => lesson.lessonTitle && lesson.date);
        lessons.sort((a, b) => new Date(a.date) - new Date(b.date));

        appContainer.innerHTML = `
            <div class="card">
                <h2>Βιβλίο Ύλης Τάξης ${className}</h2>
                <button id="back-to-home">Πίσω στις Τάξεις</button>
                <button id="add-lesson">Προσθήκη Μαθήματος</button>
                <div id="lessons-list">
                    ${lessons.length > 0 ? lessons.map((lesson, index) => `
                        <div class="lesson-card-summary" data-index="${index}">
                            <h3>${lesson.lessonTitle}</h3>
                            <p><strong>Ημερομηνία:</strong> ${formatDateForDisplay(lesson.date)}</p>
                        </div>
                    `).join('') : '<p>Δεν έχουν καταχωριστεί μαθήματα για αυτή την τάξη.</p>'}
                </div>
            </div>
        `;
    }

    function renderLessonDetails(lessonIndex) {
        const lesson = data[currentClass][lessonIndex];
        appContainer.innerHTML = `
            <div class="card lesson-details-card">
                <h2>${lesson.lessonTitle}</h2>
                <p><strong>Ημερομηνία:</strong> ${formatDateForDisplay(lesson.date)}</p>
                <p><strong>Περιγραφή:</strong> ${lesson.description}</p>
                
                <h4>Υλικό Μαθήματος</h4>
                <ul>
                    ${Object.keys(lesson.content).map(key => `
                        <li>
                            <strong>${key}:</strong>
                            <p>${lesson.content[key].title}</p>
                            ${lesson.content[key].description ? `<p>${lesson.content[key].description}</p>` : ''}
                            ${lesson.content[key].link ? `<a href="${lesson.content[key].link}" target="_blank">Άνοιγμα Συνδέσμου</a>` : ''}
                        </li>
                    `).join('')}
                </ul>

                <div class="actions">
                    <button id="edit-lesson" data-index="${lessonIndex}">Επεξεργασία</button>
                    <button id="delete-lesson" class="delete-button" data-index="${lessonIndex}">Διαγραφή</button>
                </div>
                <button id="back-to-class" data-class="${currentClass}">Πίσω στην Τάξη</button>
            </div>
        `;
    }

    function renderLessonForm(lessonIndex = null) {
        const lessonToEdit = lessonIndex !== null ? data[currentClass][lessonIndex] : null;
        
        // Καθορισμός λίστας δραστηριοτήτων βάσει τάξης
        const itemsList = currentClass === 'Νηπιαγωγείο' ? kindergartenContentItems : primaryContentItems;

        appContainer.innerHTML = `
            <div class="card">
                <h2>${lessonIndex !== null ? 'Επεξεργασία Μαθήματος' : 'Προσθήκη Μαθήματος'} για την Τάξη ${currentClass}</h2>
                <form id="lesson-form">
                    <input type="hidden" id="lesson-index" value="${lessonIndex !== null ? lessonIndex : ''}">
                    
                    <div class="form-actions-top-main">
                        <button type="submit">Αποθήκευση</button>
                        <button type="button" class="cancel-form-button">Ακύρωση</button>
                    </div>

                    <div class="form-section">
                        <h3 class="form-section-title">Γενικά Στοιχεία</h3>
                        <div class="form-group">
                            <label for="lesson-date">Ημερομηνία</label>
                            <input type="date" id="lesson-date" required value="${lessonToEdit ? lessonToEdit.date : ''}">
                        </div>
                        <div class="form-group">
                            <label for="lesson-title">Τίτλος Μαθήματος</label>
                            <input type="text" id="lesson-title" required value="${lessonToEdit ? lessonToEdit.lessonTitle : ''}">
                        </div>
                        <div class="form-group">
                            <label for="lesson-description">Περιγραφή</label>
                            <textarea id="lesson-description" rows="4" required>${lessonToEdit ? lessonToEdit.description : ''}</textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3 class="form-section-title">Υλικό Μαθήματος</h3>
                        ${itemsList.map(item => { // Χρήση της δυναμικής λίστας
                            const safeItem = item.replace(/\s/g, '-');
                            const content = lessonToEdit && lessonToEdit.content && lessonToEdit.content[item] ? lessonToEdit.content[item] : { title: '', description: '', link: '' };
                            const imagePath = `images/${imageMap[item]}`;
                            
                            // Λογική εμφάνισης/απόκρυψης κουμπιού Επικόλλησης
                            const showPasteButton = safeItem === copiedContentItem && copiedContentData; 
                            
                            return `
                                <div class="content-box" data-item="${safeItem}">
                                    <div class="content-box-header">
                                        <img src="${imagePath}" alt="${item} icon" class="content-icon">
                                        <h4>${item}</h4>
                                        <div class="form-actions-top">
                                            ${showPasteButton ? 
                                                `<button type="button" class="small-button paste-content-button" data-safe-item="${safeItem}">Επικόλληση</button>` 
                                                : ''}
                                            <button type="button" class="small-button copy-content-button" data-safe-item="${safeItem}">Αντιγραφή</button>
                                            <button type="button" class="small-button delete-content-button delete-button" data-safe-item="${safeItem}">Διαγραφή</button>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="${safeItem}-title">Τίτλος</label>
                                        <input type="text" id="${safeItem}-title" placeholder="Τίτλος ${item}" value="${content.title}">
                                    </div>
                                    <div class="form-group">
                                        <label for="${safeItem}-description">Περιγραφή</label>
                                        <input type="text" id="${safeItem}-description" placeholder="Περιγραφή ${item}" value="${content.description}">
                                    </div>
                                    <div class="form-group">
                                        <label for="${safeItem}-link">Link</label>
                                        <input type="url" id="${safeItem}-link" placeholder="Link ${item}" value="${content.link}">
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <button type="submit">Αποθήκευση</button>
                    <button type="button" class="cancel-form-button">Ακύρωση</button>
                </form>
            </div>
        `;
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('.class-card')) {
            const className = e.target.closest('.class-card').dataset.class;
            renderClassView(className);
        }
        if (e.target.closest('.lesson-card-summary')) {
            const index = e.target.closest('.lesson-card-summary').dataset.index;
            renderLessonDetails(parseInt(index));
        }
        if (e.target.id === 'export-txt') {
            exportDataToTxt();
        }
        if (e.target.id === 'import-button') {
            document.getElementById('import-txt').click();
        }
        if (e.target.id === 'back-to-class') {
            const className = e.target.dataset.class;
            renderClassView(className);
        }
        if (e.target.id === 'back-to-home') {
            renderHomeView();
        }
        if (e.target.id === 'add-lesson') {
            renderLessonForm();
        }
        if (e.target.id === 'edit-lesson') {
            const index = e.target.dataset.index;
            renderLessonForm(parseInt(index));
        }
        if (e.target.id === 'delete-lesson') {
            const index = e.target.dataset.index;
            if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το μάθημα;')) {
                data[currentClass].splice(parseInt(index), 1);
                saveData();
                renderClassView(currentClass);
            }
        }
        if (e.target.classList.contains('cancel-form-button')) {
            e.preventDefault();
            // Καθαρισμός μνήμης αντιγραφής κατά την ακύρωση
            copiedContentItem = ''; 
            copiedContentData = ''; 
            saveData();
            renderClassView(currentClass);
        }
        
        // ΛΕΙΤΟΥΡΓΙΕΣ Αντιγραφής/Επικόλλησης/Διαγραφής
        if (e.target.classList.contains('paste-content-button')) {
            const safeItem = e.target.dataset.safeItem;
            pasteContent(safeItem); 
        }
        
        if (e.target.classList.contains('copy-content-button')) {
            const safeItem = e.target.dataset.safeItem;
            copyContent(safeItem);
        }
        
        if (e.target.classList.contains('delete-content-button')) {
            const safeItem = e.target.dataset.safeItem;
            deleteContent(safeItem);
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.id === 'import-txt') {
            const file = e.target.files[0];
            if (file) {
                importDataFromTxt(file);
            }
        }
    });

    document.addEventListener('submit', (e) => {
        if (e.target.id === 'lesson-form') {
            e.preventDefault();
            const lessonIndex = document.getElementById('lesson-index').value;
            const newLesson = {
                date: document.getElementById('lesson-date').value,
                lessonTitle: document.getElementById('lesson-title').value,
                description: document.getElementById('lesson-description').value,
                content: {}
            };
            
            // Χρήση της σωστής λίστας για την αποθήκευση
            const itemsList = currentClass === 'Νηπιαγωγείο' ? kindergartenContentItems : primaryContentItems;
            
            itemsList.forEach(item => {
                const safeItem = item.replace(/\s/g, '-');
                const title = document.getElementById(`${safeItem}-title`).value;
                const description = document.getElementById(`${safeItem}-description`).value;
                const link = document.getElementById(`${safeItem}-link`).value;
                if (title.trim() !== '' || description.trim() !== '' || link.trim() !== '') {
                    newLesson.content[item] = { title, description, link };
                }
            });
            
            if (lessonIndex !== '') {
                data[currentClass][lessonIndex] = newLesson;
            } else {
                data[currentClass].push(newLesson);
            }
            
            saveData();
            renderClassView(currentClass);
        }
    });

    function exportDataToTxt() {
        let txtContent = '';
        txtContent += `ΒΙΒΛΙΟ ΥΛΗΣ ΣΧΟΛΙΚΟΥ ΕΤΟΥΣ ${new Date().getFullYear()}-${new Date().getFullYear() + 1}\n\n`;
        txtContent += `=========================================\n\n`;

        // Εξαγωγή όλων των τάξεων, συμπεριλαμβανομένου του Νηπιαγωγείου
        for (const className of allClasses) { 
            if (data.hasOwnProperty(className) && Array.isArray(data[className])) {
                txtContent += `*** ΤΑΞΗ ${className} ***\n`;
                if (data[className].length > 0) {
                    data[className].forEach(lesson => {
                        txtContent += `\n-----------------------------------------\n`;
                        txtContent += `Ημερομηνία: ${lesson.date}\n`;
                        txtContent += `Τίτλος: ${lesson.lessonTitle}\n`;
                        txtContent += `Περιγραφή: ${lesson.description}\n`;
                        txtContent += `\nΥλικό Μαθήματος:\n`;
                        for (const item in lesson.content) {
                            if (lesson.content.hasOwnProperty(item)) {
                                txtContent += `  - ${item}:\n`;
                                txtContent += `    Τίτλος: ${lesson.content[item].title}\n`;
                                txtContent += `    Περιγραφή: ${lesson.content[item].description}\n`;
                                txtContent += `    Link: ${lesson.content[item].link}\n`;
                            }
                        }
                        txtContent += `-----------------------------------------\n`;
                    });
                } else {
                    txtContent += `Δεν υπάρχουν καταχωρημένα μαθήματα.\n`;
                }
                txtContent += `\n=========================================\n\n`;
            }
        }

        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Βιβλίο_Ύλης_${new Date().getFullYear()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    function importDataFromTxt(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const text = event.target.result;
            const newData = parseTxtData(text);
            
            if (newData) { 
                if (confirm('ΠΡΟΣΟΧΗ: Η εισαγωγή θα συγχωνεύσει τα νέα δεδομένα με τα υπάρχοντα. Είστε σίγουροι ότι θέλετε να συνεχίσετε;')) {
                    for (const className in newData) {
                        if (Array.isArray(newData[className])) {
                            newData[className].forEach(lesson => {
                                const exists = data[className].some(existingLesson => 
                                    existingLesson.lessonTitle === lesson.lessonTitle && 
                                    existingLesson.date === lesson.date
                                );
                                if (!exists) {
                                    data[className].push(lesson);
                                }
                            });
                        }
                    }
                    saveData();
                    alert('Η εισαγωγή ολοκληρώθηκε με επιτυχία!');
                    renderHomeView();
                }
            } else {
                alert('Αδυναμία ανάγνωσης του αρχείου. Βεβαιωθείτε ότι το αρχείο έχει τη σωστή μορφή.');
            }
        };
        reader.onerror = function() {
            alert('Σφάλμα κατά την ανάγνωση του αρχείου.');
        };
        reader.readAsText(file);
    }

    function parseTxtData(text) {
        // ΕΝΗΜΕΡΩΣΗ: Προσθήκη Νηπιαγωγείου
        const parsedData = {
            'Νηπιαγωγείο': [], 'Α': [], 'Β': [], 'Γ': [], 'Δ': [], 'Ε': [], 'ΣΤ': []
        };
        let currentClass = '';
        let currentLesson = null;
        let currentContentItem = '';

        const lines = text.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine.length === 0) continue;

            if (trimmedLine.startsWith('*** ΤΑΞΗ')) {
                // ΕΝΗΜΕΡΩΣΗ: Λογική για εύρεση τάξης (συμπεριλαμβανομένου του Νηπιαγωγείου)
                const classMatch = trimmedLine.match(/ΤΑΞΗ (Νηπιαγωγείο|[Α-Ε]|ΣΤ)/);
                if (classMatch) {
                    currentClass = classMatch[1];
                    currentLesson = null;
                    currentContentItem = '';
                }
                continue;
            }
            
            if (!currentClass) continue;
            
            if (trimmedLine.startsWith('-----------------------------------------')) {
                if (currentLesson && currentLesson.lessonTitle && currentLesson.date) {
                    parsedData[currentClass].push(currentLesson);
                }
                currentLesson = {
                    date: '',
                    lessonTitle: '',
                    description: '',
                    content: {}
                };
                currentContentItem = '';
                continue;
            }

            if (!currentLesson) continue;

            if (trimmedLine.startsWith('Ημερομηνία:')) {
                currentLesson.date = trimmedLine.replace('Ημερομηνία:', '').trim();
            } else if (trimmedLine.startsWith('Τίτλος:') && !currentContentItem) {
                currentLesson.lessonTitle = trimmedLine.replace('Τίτλος:', '').trim();
            } else if (trimmedLine.startsWith('Περιγραφή:') && !currentContentItem) {
                currentLesson.description = trimmedLine.replace('Περιγραφή:', '').trim();
            } else if (trimmedLine.startsWith('Υλικό Μαθήματος:')) {
                currentContentItem = '';
            } else if (trimmedLine.startsWith('-')) {
                const itemMatch = trimmedLine.match(/^- ([^:]+):/);
                if (itemMatch) {
                    const item = itemMatch[1].trim();
                    currentContentItem = item;
                    currentLesson.content[currentContentItem] = {
                        title: '',
                        description: '',
                        link: ''
                    };
                }
            } else if (currentContentItem) {
                if (trimmedLine.startsWith('Τίτλος:')) {
                    currentLesson.content[currentContentItem].title = trimmedLine.replace('Τίτλος:', '').trim();
                } else if (trimmedLine.startsWith('Περιγραφή:')) {
                    currentLesson.content[currentContentItem].description = trimmedLine.replace('Περιγραφή:', '').trim();
                } else if (trimmedLine.startsWith('Link:')) {
                    currentLesson.content[currentContentItem].link = trimmedLine.replace('Link:', '').trim();
                }
            }
        }
        
        if (currentClass && currentLesson && currentLesson.lessonTitle && currentLesson.date) {
            parsedData[currentClass].push(currentLesson);
        }

        const isValid = Object.values(parsedData).some(lessons => Array.isArray(lessons) && lessons.length > 0);
        return isValid ? parsedData : null;
    }

    function copyContent(safeItem) {
        const title = document.getElementById(`${safeItem}-title`).value;
        const description = document.getElementById(`${safeItem}-description`).value;
        const link = document.getElementById(`${safeItem}-link`).value;

        const contentObject = {
            title: title,
            description: description,
            link: link
        };
        
        copiedContentItem = safeItem; 
        copiedContentData = JSON.stringify(contentObject);
        saveData(); 
        
        // Προσθέτουμε το κουμπί Επικόλληση απευθείας στο DOM
        const contentBox = document.querySelector(`.content-box[data-item="${safeItem}"]`);
        if (contentBox) {
            const formActionsTop = contentBox.querySelector('.form-actions-top');
            
            if (!formActionsTop.querySelector('.paste-content-button')) {
                const pasteButtonHtml = `<button type="button" class="small-button paste-content-button" data-safe-item="${safeItem}">Επικόλληση</button>`;
                
                const firstButton = formActionsTop.querySelector('.copy-content-button');
                if (firstButton) {
                    firstButton.insertAdjacentHTML('beforebegin', pasteButtonHtml);
                } else {
                    formActionsTop.innerHTML = pasteButtonHtml + formActionsTop.innerHTML;
                }
            }
        }
    }

    function pasteContent(safeItem) {
        
        if (copiedContentData) {
            try {
                const contentObject = JSON.parse(copiedContentData);
                
                if (contentObject && contentObject.title !== undefined) {
                    const titleInput = document.getElementById(`${safeItem}-title`);
                    const descriptionInput = document.getElementById(`${safeItem}-description`);
                    const linkInput = document.getElementById(`${safeItem}-link`);

                    if (titleInput) titleInput.value = contentObject.title || '';
                    if (descriptionInput) descriptionInput.value = contentObject.description || '';
                    if (linkInput) linkInput.value = contentObject.link || '';
                    
                    copiedContentItem = ''; 
                    copiedContentData = ''; 
                    saveData();
                    
                    // Αφαιρούμε το κουμπί Επικόλληση από το DOM
                    const contentBox = document.querySelector(`.content-box[data-item="${safeItem}"]`);
                    const pasteButton = contentBox.querySelector('.paste-content-button');
                    if (pasteButton) {
                        pasteButton.remove();
                    }
                    
                } else {
                    console.error('Λανθασμένη μορφή δεδομένων αντιγραφής.');
                }
            } catch (err) {
                console.error('Σφάλμα κατά την επεξεργασία των δεδομένων αντιγραφής (JSON Parse): ', err);
            }
        } else {
             console.log('Δεν βρέθηκαν δεδομένα για επικόλληση.');
        }
    }

    function deleteContent(safeItem) {
        if (confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε όλα τα στοιχεία για το υλικό '${safeItem.replace(/-/g, ' ')}';`)) {
            document.getElementById(`${safeItem}-title`).value = '';
            document.getElementById(`${safeItem}-description`).value = '';
            document.getElementById(`${safeItem}-link`).value = '';
        }
    }

    renderHomeView();
});
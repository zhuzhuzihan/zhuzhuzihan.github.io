class ScheduleManager {
    constructor() {
        this.settings = this.loadSettings();
        this.courses = this.loadCourses();
        this.presetCourses = this.loadPresetCourses();
        this.currentTimeSlot = null;
        this.countdownInterval = null;
        this.init();
    }

    init() {
        this.checkUrlConfig();
        this.updateSettingsDisplay();
        this.updateSettingsForm();
        this.generateTimeSlots();
        this.renderReadOnlySchedule();
        this.renderEditableSchedule();
        this.renderPresetCoursesTableInSettings();
        this.updatePresetCourseSelect();
        this.updateCurrentStatus();
        this.startCountdown();
        this.bindEvents();
    }

    loadSettings() {
        const saved = localStorage.getItem('scheduleSettings');
        return saved ? JSON.parse(saved) : {
            startTime: '08:00',
            endTime: '17:00',
            classDuration: 45,
            breakDuration: 10,
            lunchStartTime: '12:00',
            lunchEndTime: '13:30',
            maxClasses: 8,
            dinnerStartTime: '17:30',
            dinnerEndTime: '18:30',
            eveningStudyStartTime: '19:00',
            eveningStudyEndTime: '21:00',
            eveningStudyDuration: 45,
            eveningStudyBreak: 10,
            maxEveningClasses: 3
        };
    }

    saveSettings() {
        localStorage.setItem('scheduleSettings', JSON.stringify(this.settings));
        this.updateSettingsDisplay();
        this.updateSettingsForm();
        this.generateTimeSlots();
        this.renderReadOnlySchedule();
        this.renderEditableSchedule();
        this.updateCurrentStatus();
    }

    loadCourses() {
        const saved = localStorage.getItem('courses');
        return saved ? JSON.parse(saved) : {};
    }

    saveCourses() {
        localStorage.setItem('courses', JSON.stringify(this.courses));
        this.renderReadOnlySchedule();
        this.renderEditableSchedule();
        this.updateCurrentStatus();
    }

    loadPresetCourses() {
        const saved = localStorage.getItem('presetCourses');
        return saved ? JSON.parse(saved) : [];
    }

    savePresetCourses() {
        localStorage.setItem('presetCourses', JSON.stringify(this.presetCourses));
        this.renderPresetCoursesTableInSettings();
        this.updatePresetCourseSelect();
    }

    updateSettingsDisplay() {
        document.getElementById('classStartTime').textContent = this.settings.startTime;
        document.getElementById('classEndTime').textContent = this.settings.endTime;
        document.getElementById('classDuration').textContent = this.settings.classDuration;
        document.getElementById('breakDuration').textContent = this.settings.breakDuration;
        document.getElementById('lunchStartTime').textContent = this.settings.lunchStartTime;
        document.getElementById('lunchEndTime').textContent = this.settings.lunchEndTime;
        document.getElementById('maxClassesDisplay').textContent = this.settings.maxClasses;
        document.getElementById('dinnerTimeDisplay').textContent = `${this.settings.dinnerStartTime}-${this.settings.dinnerEndTime}`;
        document.getElementById('eveningStudyTimeDisplay').textContent = `${this.settings.eveningStudyStartTime}-${this.settings.eveningStudyEndTime}`;
        document.getElementById('eveningStudyDurationDisplay').textContent = this.settings.eveningStudyDuration;
        document.getElementById('eveningStudyBreakDisplay').textContent = this.settings.eveningStudyBreak;
        document.getElementById('maxEveningClassesDisplay').textContent = this.settings.maxEveningClasses;
    }

    updateSettingsForm() {
        document.getElementById('startTime').value = this.settings.startTime;
        document.getElementById('endTime').value = this.settings.endTime;
        document.getElementById('duration').value = this.settings.classDuration;
        document.getElementById('breakTime').value = this.settings.breakDuration;
        document.getElementById('lunchStart').value = this.settings.lunchStartTime;
        document.getElementById('lunchEnd').value = this.settings.lunchEndTime;
        document.getElementById('maxClasses').value = this.settings.maxClasses;
        
        // 安全地更新新添加的元素
        const dinnerStart = document.getElementById('dinnerStartTime');
        const dinnerEnd = document.getElementById('dinnerEndTime');
        const eveningStudyStart = document.getElementById('eveningStudyStartTime');
        const eveningStudyEnd = document.getElementById('eveningStudyEndTime');
        const eveningDuration = document.getElementById('eveningStudyDuration');
        const eveningBreak = document.getElementById('eveningStudyBreak');
        const maxEvening = document.getElementById('maxEveningClasses');
        
        if (dinnerStart) dinnerStart.value = this.settings.dinnerStartTime;
        if (dinnerEnd) dinnerEnd.value = this.settings.dinnerEndTime;
        if (eveningStudyStart) eveningStudyStart.value = this.settings.eveningStudyStartTime;
        if (eveningStudyEnd) eveningStudyEnd.value = this.settings.eveningStudyEndTime;
        if (eveningDuration) eveningDuration.value = this.settings.eveningStudyDuration;
        if (eveningBreak) eveningBreak.value = this.settings.eveningStudyBreak;
        if (maxEvening) maxEvening.value = this.settings.maxEveningClasses;
    }

    generateTimeSlots() {
        const start = this.timeToMinutes(this.settings.startTime);
        const end = this.timeToMinutes(this.settings.endTime);
        const classDuration = this.settings.classDuration;
        const breakDuration = this.settings.breakDuration;
        const lunchStart = this.timeToMinutes(this.settings.lunchStartTime);
        const lunchEnd = this.timeToMinutes(this.settings.lunchEndTime);
        const maxClasses = this.settings.maxClasses;
        
        // 晚自习相关设置
        const eveningStudyStart = this.timeToMinutes(this.settings.eveningStudyStartTime);
        const eveningStudyEnd = this.timeToMinutes(this.settings.eveningStudyEndTime);
        const eveningStudyDuration = this.settings.eveningStudyDuration;
        const eveningStudyBreak = this.settings.eveningStudyBreak;
        const maxEveningClasses = this.settings.maxEveningClasses;
        
        this.timeSlots = [];
        
        // 生成白天课程时间段
        let currentTime = start;
        let classCount = 0;
        
        while (currentTime + classDuration <= end && classCount < maxClasses) {
            // 检查是否与午休时间冲突
            const slotEnd = currentTime + classDuration;
            
            // 如果当前时间段会与午休重叠，跳到午休结束后
            if (currentTime < lunchEnd && slotEnd > lunchStart) {
                currentTime = lunchEnd;
                // 不增加classCount，因为这一节被跳过了
                continue;
            }
            
            const slotStart = this.minutesToTime(currentTime);
            const slotEndStr = this.minutesToTime(slotEnd);
            
            this.timeSlots.push({
                start: slotStart,
                end: slotEndStr,
                startMinutes: currentTime,
                endMinutes: slotEnd,
                type: 'day'
            });
            
            currentTime += classDuration + breakDuration;
            classCount++;
        }
        
        // 生成晚自习时间段
        currentTime = eveningStudyStart;
        let eveningClassCount = 0;
        
        while (currentTime + eveningStudyDuration <= eveningStudyEnd && eveningClassCount < maxEveningClasses) {
            const slotStart = this.minutesToTime(currentTime);
            const slotEndStr = this.minutesToTime(currentTime + eveningStudyDuration);
            
            this.timeSlots.push({
                start: slotStart,
                end: slotEndStr,
                startMinutes: currentTime,
                endMinutes: currentTime + eveningStudyDuration,
                type: 'evening'
            });
            
            currentTime += eveningStudyDuration + eveningStudyBreak;
            eveningClassCount++;
        }

        this.updateCourseTimeOptions();
    }

    updateCourseTimeOptions() {
        const select = document.getElementById('courseTime');
        select.innerHTML = '';
        
        this.timeSlots.forEach((slot, index) => {
            const option = document.createElement('option');
            option.value = index;
            const periodText = slot.type === 'evening' ? '晚自习' : '白天';
            option.textContent = `第${index + 1}节 (${periodText}) ${slot.start}-${slot.end}`;
            select.appendChild(option);
        });
    }

    renderSchedule() {
        const tbody = document.getElementById('scheduleBody');
        tbody.innerHTML = '';

        this.timeSlots.forEach((slot, timeIndex) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="fw-bold">${slot.start}-${slot.end}</td>`;
            
            for (let day = 1; day <= 7; day++) {
                const courseKey = `${day}-${timeIndex}`;
                const course = this.courses[courseKey];
                
                const cell = document.createElement('td');
                cell.dataset.day = day;
                cell.dataset.time = timeIndex;
                
                if (course) {
                    const courseStyle = course.color ? `style="background: linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%);"` : '';
                    cell.innerHTML = `
                        <div class="course-item" ${courseStyle}>
                            <div class="course-name fw-bold">${course.name}</div>
                            <div class="course-teacher small">${course.teacher || ''}</div>
                            <div class="course-location small">${course.location || ''}</div>
                            ${course.description ? `<div class="course-description small text-muted">${course.description}</div>` : ''}
                            <button class="btn btn-sm btn-outline-light mt-1" onclick="scheduleManager.removeCourse(${day}, ${timeIndex})">删除</button>
                        </div>
                    `;
                } else {
                    cell.innerHTML = `<button class="btn btn-sm btn-outline-primary" onclick="scheduleManager.showAddCourse(${day}, ${timeIndex})">添加</button>`;
                }
                
                row.appendChild(cell);
            }
            
            tbody.appendChild(row);
        });
    }

    showAddCourse(day, timeIndex) {
        document.getElementById('courseDay').value = day;
        document.getElementById('courseTime').value = timeIndex;
        
        const modal = new bootstrap.Modal(document.getElementById('courseModal'));
        modal.show();
    }

    addCourse(courseData) {
        const key = `${courseData.day}-${courseData.timeIndex}`;
        this.courses[key] = {
            name: courseData.name,
            teacher: courseData.teacher,
            location: courseData.location
        };
        this.saveCourses();
    }

    removeCourse(day, timeIndex) {
        const key = `${day}-${timeIndex}`;
        delete this.courses[key];
        this.saveCourses();
    }

    updateCurrentStatus() {
        const now = new Date();
        const currentDay = now.getDay() === 0 ? 7 : now.getDay();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        // 检查当前时间段状态
        const timeStatus = this.getCurrentTimeStatus(currentMinutes);
        
        let currentCourse = null;
        let nextCourse = null;
        let currentTimeSlot = null;
        
        // 查找当前课程和下节课
        for (let i = 0; i < this.timeSlots.length; i++) {
            const slot = this.timeSlots[i];
            
            if (currentMinutes >= slot.startMinutes && currentMinutes < slot.endMinutes) {
                currentTimeSlot = slot;
                const courseKey = `${currentDay}-${i}`;
                currentCourse = this.courses[courseKey];
            }
            
            if (currentMinutes < slot.startMinutes) {
                const courseKey = `${currentDay}-${i}`;
                if (this.courses[courseKey]) {
                    nextCourse = this.courses[courseKey];
                    nextCourse.timeSlot = slot;
                    break;
                }
            }
        }
        
        this.displayCurrentStatus(currentCourse, currentTimeSlot, timeStatus);
        this.displayNextCourse(nextCourse);
        this.currentTimeSlot = currentTimeSlot;
    }

    getCurrentTimeStatus(currentMinutes) {
        const lunchStart = this.timeToMinutes(this.settings.lunchStartTime);
        const lunchEnd = this.timeToMinutes(this.settings.lunchEndTime);
        const dinnerStart = this.timeToMinutes(this.settings.dinnerStartTime);
        const dinnerEnd = this.timeToMinutes(this.settings.dinnerEndTime);
        const eveningStudyStart = this.timeToMinutes(this.settings.eveningStudyStartTime);
        const eveningStudyEnd = this.timeToMinutes(this.settings.eveningStudyEndTime);
        const dayEnd = this.timeToMinutes(this.settings.endTime);
        
        // 检查是否在午休时间
        if (currentMinutes >= lunchStart && currentMinutes < lunchEnd) {
            return {
                type: 'lunch',
                name: '午休时间',
                startTime: this.settings.lunchStartTime,
                endTime: this.settings.lunchEndTime,
                startMinutes: lunchStart,
                endMinutes: lunchEnd
            };
        }
        
        // 检查是否在晚饭时间
        if (currentMinutes >= dinnerStart && currentMinutes < dinnerEnd) {
            return {
                type: 'dinner',
                name: '晚饭时间',
                startTime: this.settings.dinnerStartTime,
                endTime: this.settings.dinnerEndTime,
                startMinutes: dinnerStart,
                endMinutes: dinnerEnd
            };
        }
        
        // 检查是否在晚自习时间
        if (currentMinutes >= eveningStudyStart && currentMinutes < eveningStudyEnd) {
            return {
                type: 'evening',
                name: '晚自习时间',
                startTime: this.settings.eveningStudyStartTime,
                endTime: this.settings.eveningStudyEndTime,
                startMinutes: eveningStudyStart,
                endMinutes: eveningStudyEnd
            };
        }
        
        // 检查是否在课程时间段内
        for (let i = 0; i < this.timeSlots.length; i++) {
            const slot = this.timeSlots[i];
            if (currentMinutes >= slot.startMinutes && currentMinutes < slot.endMinutes) {
                return {
                    type: 'class',
                    name: '课程时间',
                    timeSlot: slot
                };
            }
        }
        
        // 检查是否在课间休息时间
        for (let i = 0; i < this.timeSlots.length - 1; i++) {
            const currentSlot = this.timeSlots[i];
            const nextSlot = this.timeSlots[i + 1];
            if (currentMinutes >= currentSlot.endMinutes && currentMinutes < nextSlot.startMinutes) {
                return {
                    type: 'break',
                    name: '课间休息',
                    startTime: this.minutesToTime(currentSlot.endMinutes),
                    endTime: this.minutesToTime(nextSlot.startMinutes),
                    startMinutes: currentSlot.endMinutes,
                    endMinutes: nextSlot.startMinutes
                };
            }
        }
        
        // 检查是否已放学
        if (currentMinutes >= dayEnd && currentMinutes < eveningStudyStart) {
            return {
                type: 'afterSchool',
                name: '放学时间',
                startTime: this.settings.endTime,
                endTime: this.settings.eveningStudyStartTime,
                startMinutes: dayEnd,
                endMinutes: eveningStudyStart
            };
        }
        
        // 其他时间
        return {
            type: 'other',
            name: '课外时间',
            startTime: '00:00',
            endTime: '23:59',
            startMinutes: 0,
            endMinutes: 1439
        };
    }

    displayCurrentStatus(course, timeSlot, timeStatus) {
        const container = document.getElementById('currentCourse');
        
        if (timeStatus.type === 'class' && course && timeSlot) {
            // 正在上课
            container.innerHTML = `
                <h6 class="text-primary">${course.name}</h6>
                <p class="mb-1"><strong>时间：</strong>${timeSlot.start} - ${timeSlot.end}</p>
                <p class="mb-1"><strong>教师：</strong>${course.teacher || '未指定'}</p>
                <p class="mb-0"><strong>地点：</strong>${course.location || '未指定'}</p>
            `;
        } else if (timeStatus.type === 'class' && !course) {
            // 课程时间但无课程
            container.innerHTML = `
                <h6 class="text-warning">空闲时间</h6>
                <p class="mb-1"><strong>时间：</strong>${timeStatus.timeSlot.start} - ${timeStatus.timeSlot.end}</p>
                <p class="mb-0 text-muted">此时间段暂无课程安排</p>
            `;
        } else {
            // 其他时间段
            let statusClass = 'text-info';
            let statusIcon = '';
            
            switch (timeStatus.type) {
                case 'break':
                    statusClass = 'text-success';
                    statusIcon = '☕';
                    break;
                case 'lunch':
                    statusClass = 'text-warning';
                    statusIcon = '🍱';
                    break;
                case 'dinner':
                    statusClass = 'text-danger';
                    statusIcon = '🍽️';
                    break;
                case 'evening':
                    statusClass = 'text-primary';
                    statusIcon = '📚';
                    break;
                case 'afterSchool':
                    statusClass = 'text-secondary';
                    statusIcon = '🏠';
                    break;
                default:
                    statusClass = 'text-muted';
                    statusIcon = '⏰';
            }
            
            container.innerHTML = `
                <h6 class="${statusClass}">${statusIcon} ${timeStatus.name}</h6>
                <p class="mb-1"><strong>时间：</strong>${timeStatus.startTime} - ${timeStatus.endTime}</p>
                <p class="mb-0">${this.getTimeStatusDescription(timeStatus)}</p>
            `;
        }
    }

    getTimeStatusDescription(timeStatus) {
        switch (timeStatus.type) {
            case 'break':
                return '课间休息，准备下一节课';
            case 'lunch':
                return '午休时间，注意休息';
            case 'dinner':
                return '晚饭时间，补充能量';
            case 'evening':
                return '晚自习时间，专注学习';
            case 'afterSchool':
                return '放学时间，今日课程已结束';
            default:
                return '课外时间';
        }
    }

    displayNextCourse(course) {
        const container = document.getElementById('nextCourse');
        
        if (course && course.timeSlot) {
            container.innerHTML = `
                <h6 class="text-success">${course.name}</h6>
                <p class="mb-1"><strong>时间：</strong>${course.timeSlot.start} - ${course.timeSlot.end}</p>
                <p class="mb-1"><strong>教师：</strong>${course.teacher || '未指定'}</p>
                <p class="mb-0"><strong>地点：</strong>${course.location || '未指定'}</p>
            `;
        } else {
            container.innerHTML = '<p class="text-muted">暂无课程</p>';
        }
    }

    startCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.updateCountdown();
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
            this.updateCurrentStatus();
        }, 1000);
    }

    updateCountdown() {
        const countdownElement = document.getElementById('countdown');
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const currentSeconds = now.getSeconds();
        
        // 获取当前时间段状态
        const timeStatus = this.getCurrentTimeStatus(currentMinutes);
        let endTime = 0;
        
        // 根据不同的时间段类型确定结束时间
        switch (timeStatus.type) {
            case 'class':
                if (timeStatus.timeSlot) {
                    endTime = timeStatus.timeSlot.endMinutes;
                }
                break;
            case 'break':
            case 'lunch':
            case 'dinner':
            case 'evening':
            case 'afterSchool':
                endTime = timeStatus.endMinutes;
                break;
            default:
                // 对于其他时间，显示到下一个整点
                endTime = (Math.floor(currentMinutes / 60) + 1) * 60;
        }
        
        if (endTime > 0) {
            const remainingMinutes = endTime - currentMinutes - 1;
            const remainingSeconds = 60 - currentSeconds;
            
            if (remainingMinutes >= 0) {
                const hours = Math.floor(remainingMinutes / 60);
                const minutes = remainingMinutes % 60;
                countdownElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
                return;
            }
        }
        
        countdownElement.textContent = '00:00:00';
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    exportConfig() {
        try {
            const config = {
                version: '1.0',
                exportTime: new Date().toISOString(),
                settings: this.settings,
                courses: this.courses,
                presetCourses: this.presetCourses
            };
            
            const dataStr = JSON.stringify(config, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `课程表配置_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href);
            
            // 显示成功提示
            this.showNotification('配置导出成功！', 'success');
        } catch (error) {
            console.error('导出配置失败:', error);
            this.showNotification('导出配置失败，请重试', 'error');
        }
    }

    importConfig(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.type !== 'application/json') {
            this.showNotification('请选择JSON格式的配置文件', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                
                // 验证配置格式
                if (!config.settings || !config.courses) {
                    throw new Error('配置文件格式不正确');
                }
                
                // 确认导入
                if (confirm('导入配置将覆盖当前所有设置、课程和预选课程，是否继续？')) {
                    // 导入设置
                    this.settings = { ...this.settings, ...config.settings };
                    this.saveSettings();
                    
                    // 导入课程
                    this.courses = config.courses;
                    this.saveCourses();
                    
                    // 导入预选课程
                    if (config.presetCourses) {
                        this.presetCourses = config.presetCourses;
                        this.savePresetCourses();
                    }
                    
                    // 重新初始化
                    this.updateSettingsDisplay();
                    this.updateSettingsForm();
                    this.generateTimeSlots();
                    this.renderReadOnlySchedule();
                    this.renderEditableSchedule();
                    this.renderPresetCoursesTableInSettings();
                    this.updatePresetCourseSelect();
                    this.updateCurrentStatus();
                    
                    this.showNotification('配置导入成功！', 'success');
                }
            } catch (error) {
                console.error('导入配置失败:', error);
                this.showNotification('导入配置失败：' + error.message, 'error');
            }
        };
        
        reader.onerror = () => {
            this.showNotification('文件读取失败', 'error');
        };
        
        reader.readAsText(file);
        
        // 清空文件输入，允许重复选择同一文件
        event.target.value = '';
    }

    renderReadOnlySchedule() {
        const tbody = document.getElementById('readOnlyScheduleBody');
        tbody.innerHTML = '';

        this.timeSlots.forEach((slot, timeIndex) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="fw-bold">${slot.start}-${slot.end}</td>`;
            
            for (let day = 1; day <= 7; day++) {
                const courseKey = `${day}-${timeIndex}`;
                const course = this.courses[courseKey];
                
                const cell = document.createElement('td');
                
                if (course) {
                    const courseStyle = course.color ? `style="background: linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%);"` : '';
                    cell.innerHTML = `
                        <div class="course-item p-2" ${courseStyle}>
                            <div class="course-name fw-bold">${course.name}</div>
                            <div class="course-teacher small">${course.teacher || ''}</div>
                            <div class="course-location small">${course.location || ''}</div>
                            ${course.description ? `<div class="course-description small text-muted">${course.description}</div>` : ''}
                        </div>
                    `;
                } else {
                    cell.innerHTML = '<span class="text-muted">-</span>';
                }
                
                row.appendChild(cell);
            }
            
            tbody.appendChild(row);
        });
    }

    renderEditableSchedule() {
        const tbody = document.getElementById('editableScheduleBody');
        tbody.innerHTML = '';

        this.timeSlots.forEach((slot, timeIndex) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="fw-bold">${slot.start}-${slot.end}</td>`;
            
            for (let day = 1; day <= 7; day++) {
                const courseKey = `${day}-${timeIndex}`;
                const course = this.courses[courseKey];
                
                const cell = document.createElement('td');
                cell.dataset.day = day;
                cell.dataset.time = timeIndex;
                
                if (course) {
                    const courseStyle = course.color ? `style="background: linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%);"` : '';
                    cell.innerHTML = `
                        <div class="course-item" ${courseStyle}>
                            <div class="course-name fw-bold">${course.name}</div>
                            <div class="course-teacher small">${course.teacher || ''}</div>
                            <div class="course-location small">${course.location || ''}</div>
                            ${course.description ? `<div class="course-description small text-muted">${course.description}</div>` : ''}
                            <button class="btn btn-sm btn-outline-light mt-1" onclick="scheduleManager.removeCourse(${day}, ${timeIndex})">删除</button>
                        </div>
                    `;
                } else {
                    cell.innerHTML = `<button class="btn btn-sm btn-outline-primary" onclick="scheduleManager.showAddCourse(${day}, ${timeIndex})">添加</button>`;
                }
                
                row.appendChild(cell);
            }
            
            tbody.appendChild(row);
        });
    }

    renderPresetCoursesTableInSettings() {
        const tbody = document.getElementById('presetCoursesTableInSettings');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.presetCourses.forEach((course, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.name}</td>
                <td>${course.teacher || '-'}</td>
                <td>${course.location || '-'}</td>
                <td>
                    <span class="badge" style="background-color: ${course.color || '#667eea'};">
                        ${course.color || '#667eea'}
                    </span>
                </td>
                <td>${course.description || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="scheduleManager.editPresetCourseInSettings(${index})">编辑</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="scheduleManager.deletePresetCourse(${index})">删除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updatePresetCourseSelect() {
        const select = document.getElementById('presetCourseSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">请选择预选课程...</option>';
        
        this.presetCourses.forEach((course, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${course.name} - ${course.teacher || '未指定教师'}`;
            select.appendChild(option);
        });
    }

    addPresetCourse(courseData) {
        const course = {
            name: courseData.name,
            teacher: courseData.teacher,
            location: courseData.location,
            color: courseData.color,
            description: courseData.description,
            id: Date.now()
        };
        
        this.presetCourses.push(course);
        this.savePresetCourses();
        this.showNotification('预选课程添加成功！', 'success');
    }

    editPresetCourseInSettings(index) {
        const course = this.presetCourses[index];
        if (!course) return;
        
        // 切换到预选课程选项卡
        const presetTab = document.getElementById('preset-courses-tab');
        const tab = new bootstrap.Tab(presetTab);
        tab.show();
        
        // 填充表单
        document.getElementById('presetCourseNameInSettings').value = course.name;
        document.getElementById('presetCourseTeacherInSettings').value = course.teacher || '';
        document.getElementById('presetCourseLocationInSettings').value = course.location || '';
        document.getElementById('presetCourseColorInSettings').value = course.color || '#667eea';
        document.getElementById('presetCourseDescriptionInSettings').value = course.description || '';
        
        // 展开表单
        const form = document.getElementById('addPresetCourseFormInSettings');
        const collapse = new bootstrap.Collapse(form, { show: true });
        
        // 更新表单提交行为为编辑模式
        const formElement = document.getElementById('presetCourseFormInSettings');
        formElement.dataset.editIndex = index;
        
        // 滚动到表单
        setTimeout(() => {
            form.scrollIntoView({ behavior: 'smooth' });
        }, 200);
    }

    deletePresetCourse(index) {
        if (confirm('确定要删除这个预选课程吗？')) {
            this.presetCourses.splice(index, 1);
            this.savePresetCourses();
            this.showNotification('预选课程删除成功！', 'success');
        }
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // 自动移除通知
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    bindEvents() {
        document.getElementById('saveSettings').addEventListener('click', () => {
            try {
                this.settings.startTime = document.getElementById('startTime').value;
                this.settings.endTime = document.getElementById('endTime').value;
                this.settings.classDuration = parseInt(document.getElementById('duration').value);
                this.settings.breakDuration = parseInt(document.getElementById('breakTime').value);
                this.settings.lunchStartTime = document.getElementById('lunchStart').value;
                this.settings.lunchEndTime = document.getElementById('lunchEnd').value;
                this.settings.maxClasses = parseInt(document.getElementById('maxClasses').value);
                
                // 检查新添加的元素是否存在
                const dinnerStart = document.getElementById('dinnerStartTime');
                const dinnerEnd = document.getElementById('dinnerEndTime');
                const eveningStudyStart = document.getElementById('eveningStudyStartTime');
                const eveningStudyEnd = document.getElementById('eveningStudyEndTime');
                const eveningDuration = document.getElementById('eveningStudyDuration');
                const eveningBreak = document.getElementById('eveningStudyBreak');
                const maxEvening = document.getElementById('maxEveningClasses');
                
                if (dinnerStart) this.settings.dinnerStartTime = dinnerStart.value;
                if (dinnerEnd) this.settings.dinnerEndTime = dinnerEnd.value;
                if (eveningStudyStart) this.settings.eveningStudyStartTime = eveningStudyStart.value;
                if (eveningStudyEnd) this.settings.eveningStudyEndTime = eveningStudyEnd.value;
                if (eveningDuration) this.settings.eveningStudyDuration = parseInt(eveningDuration.value);
                if (eveningBreak) this.settings.eveningStudyBreak = parseInt(eveningBreak.value);
                if (maxEvening) this.settings.maxEveningClasses = parseInt(maxEvening.value);
                
                this.saveSettings();
                bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
            } catch (error) {
                console.error('保存设置时出错:', error);
                alert('保存设置时出错，请检查输入值是否正确');
            }
        });

        document.getElementById('saveCourse').addEventListener('click', () => {
            const inputType = document.querySelector('input[name="courseInputType"]:checked').value;
            let courseData;
            
            if (inputType === 'preset') {
                const presetIndex = parseInt(document.getElementById('presetCourseSelect').value);
                if (isNaN(presetIndex) || !this.presetCourses[presetIndex]) {
                    alert('请选择一个预选课程');
                    return;
                }
                
                const presetCourse = this.presetCourses[presetIndex];
                courseData = {
                    day: parseInt(document.getElementById('courseDay').value),
                    timeIndex: parseInt(document.getElementById('courseTime').value),
                    name: presetCourse.name,
                    teacher: presetCourse.teacher,
                    location: presetCourse.location,
                    color: presetCourse.color,
                    description: presetCourse.description,
                    fromPreset: true,
                    presetId: presetCourse.id
                };
            } else {
                courseData = {
                    day: parseInt(document.getElementById('courseDay').value),
                    timeIndex: parseInt(document.getElementById('courseTime').value),
                    name: document.getElementById('courseName').value,
                    teacher: document.getElementById('courseTeacher').value,
                    location: document.getElementById('courseLocation').value,
                    fromPreset: false
                };
            }
            
            if (courseData.name) {
                this.addCourse(courseData);
                document.getElementById('courseForm').reset();
                document.getElementById('manualInput').checked = true;
                this.toggleCourseInputType('manual');
                bootstrap.Modal.getInstance(document.getElementById('courseModal')).hide();
            }
        });

        // 课程输入方式切换
        document.querySelectorAll('input[name="courseInputType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.toggleCourseInputType(e.target.value);
            });
        });

        // 预选课程表单提交（在设置中）
        document.getElementById('presetCourseFormInSettings').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const editIndex = e.target.dataset.editIndex;
            const courseData = {
                name: document.getElementById('presetCourseNameInSettings').value,
                teacher: document.getElementById('presetCourseTeacherInSettings').value,
                location: document.getElementById('presetCourseLocationInSettings').value,
                color: document.getElementById('presetCourseColorInSettings').value,
                description: document.getElementById('presetCourseDescriptionInSettings').value
            };
            
            if (editIndex !== undefined) {
                // 编辑模式
                this.presetCourses[editIndex] = { ...this.presetCourses[editIndex], ...courseData };
                delete e.target.dataset.editIndex;
                this.showNotification('预选课程更新成功！', 'success');
            } else {
                // 添加模式
                this.addPresetCourse(courseData);
            }
            
            e.target.reset();
            const collapse = bootstrap.Collapse.getInstance(document.getElementById('addPresetCourseFormInSettings'));
            if (collapse) collapse.hide();
        });

        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('saveSettings').click();
        });

        document.getElementById('courseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('saveCourse').click();
        });
    }

    toggleCourseInputType(type) {
        const manualArea = document.getElementById('manualInputArea');
        const presetArea = document.getElementById('presetInputArea');
        
        if (type === 'manual') {
            manualArea.style.display = 'block';
            presetArea.style.display = 'none';
            document.getElementById('courseName').required = true;
        } else {
            manualArea.style.display = 'none';
            presetArea.style.display = 'block';
            document.getElementById('courseName').required = false;
        }
    }

    checkUrlConfig() {
        const urlParams = new URLSearchParams(window.location.search);
        const configParam = urlParams.get('config');
        
        if (configParam) {
            try {
                const config = JSON.parse(decodeURIComponent(configParam));
                this.loadConfigFromUrl(config);
            } catch (error) {
                console.error('URL配置解析失败:', error);
                this.showNotification('URL配置格式错误', 'error');
            }
        }
    }

    loadConfigFromUrl(config) {
        try {
            // 验证配置格式
            if (!config.settings || !config.courses) {
                throw new Error('配置文件格式不正确');
            }
            
            // 确认导入
            if (confirm('检测到URL配置，是否加载？这将覆盖当前所有设置、课程和预选课程。')) {
                // 导入设置
                this.settings = { ...this.settings, ...config.settings };
                this.saveSettings();
                
                // 导入课程
                this.courses = config.courses;
                this.saveCourses();
                
                // 导入预选课程
                if (config.presetCourses) {
                    this.presetCourses = config.presetCourses;
                    this.savePresetCourses();
                }
                
                // 重新初始化
                this.updateSettingsDisplay();
                this.updateSettingsForm();
                this.generateTimeSlots();
                this.renderReadOnlySchedule();
                this.renderEditableSchedule();
                this.renderPresetCoursesTableInSettings();
                this.updatePresetCourseSelect();
                this.updateCurrentStatus();
                
                this.showNotification('URL配置加载成功！', 'success');
                
                // 清除URL参数
                const url = new URL(window.location);
                url.searchParams.delete('config');
                window.history.replaceState({}, '', url);
            }
        } catch (error) {
            console.error('加载URL配置失败:', error);
            this.showNotification('加载URL配置失败：' + error.message, 'error');
        }
    }

    generateConfigUrl() {
        try {
            const config = {
                version: '1.0',
                exportTime: new Date().toISOString(),
                settings: this.settings,
                courses: this.courses,
                presetCourses: this.presetCourses
            };
            
            const configStr = JSON.stringify(config);
            const encodedConfig = encodeURIComponent(configStr);
            const baseUrl = window.location.origin + window.location.pathname;
            const configUrl = `${baseUrl}?config=${encodedConfig}`;
            
            // 复制到剪贴板
            navigator.clipboard.writeText(configUrl).then(() => {
                this.showNotification('配置URL已复制到剪贴板！', 'success');
            }).catch(() => {
                // 如果剪贴板API不可用，显示URL供手动复制
                this.showConfigUrlDialog(configUrl);
            });
        } catch (error) {
            console.error('生成配置URL失败:', error);
            this.showNotification('生成配置URL失败', 'error');
        }
    }

    showConfigUrlDialog(url) {
        // 创建模态框显示URL
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">配置URL</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>请复制以下URL分享配置：</p>
                        <div class="input-group">
                            <input type="text" class="form-control" value="${url}" readonly id="configUrlInput">
                            <button class="btn btn-outline-primary" onclick="document.getElementById('configUrlInput').select()">选择</button>
                        </div>
                        <p class="text-muted mt-2">注意：URL长度有限制，复杂配置可能无法完整传输。</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }
}

let scheduleManager;

document.addEventListener('DOMContentLoaded', () => {
    scheduleManager = new ScheduleManager();
});
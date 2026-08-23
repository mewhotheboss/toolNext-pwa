document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const tabAge = document.getElementById('tab-age');
  const tabTahajjut = document.getElementById('tab-tahajjut');
  const tabBmi = document.getElementById('tab-bmi');
  const panelAge = document.getElementById('panel-age');
  const panelTahajjut = document.getElementById('panel-tahajjut');
  const panelBmi = document.getElementById('panel-bmi');

  const ageForm = document.getElementById('age-form');
  const birthDateInput = document.getElementById('birth-date');
  const targetDateInput = document.getElementById('target-date');
  const ageResults = document.getElementById('age-results');
  const resYears = document.getElementById('result-years');
  const resMonths = document.getElementById('result-months');
  const resDays = document.getElementById('result-days');
  const bdayCountdown = document.getElementById('birthday-countdown');
  const bdayWeekday = document.getElementById('birthday-weekday');
  const statMonths = document.getElementById('stat-total-months');
  const statDays = document.getElementById('stat-total-days');

  const tahajjutForm = document.getElementById('tahajjut-form');
  const maghribInput = document.getElementById('maghrib-time');
  const fajrInput = document.getElementById('fajr-time');
  const tahajjutResults = document.getElementById('tahajjut-results');
  const resTahajjutStart = document.getElementById('tahajjut-start-time');
  const resTotalGap = document.getElementById('tahajjut-total-gap');
  const resThird1 = document.getElementById('tahajjut-third-1');
  const resThird2 = document.getElementById('tahajjut-third-2');
  const resTahajjutDuration = document.getElementById('tahajjut-duration');
  
  const lblMaghrib = document.getElementById('lbl-maghrib');
  const lblThird1 = document.getElementById('lbl-third1');
  const lblThird2 = document.getElementById('lbl-third2');
  const lblFajr = document.getElementById('lbl-fajr');
  const currentMarker = document.getElementById('timeline-current-marker');

  const bmiForm = document.getElementById('bmi-form');
  const bmiAgeInput = document.getElementById('bmi-age');
  const bmiGenderMale = document.getElementById('bmi-gender-male');
  const bmiGenderFemale = document.getElementById('bmi-gender-female');
  const heightFtInput = document.getElementById('bmi-height-ft');
  const heightInInput = document.getElementById('bmi-height-in');
  const weightInput = document.getElementById('bmi-weight');
  const bmiClearBtn = document.getElementById('bmi-clear-btn');
  const bmiResults = document.getElementById('bmi-results');
  const bmiValDisplay = document.getElementById('bmi-val-display');
  const bmiCategoryBadge = document.getElementById('bmi-category-badge');
  const bmiHealthyRange = document.getElementById('bmi-healthy-range');
  const bmiWeightDiff = document.getElementById('bmi-weight-diff');
  const bmiWeightDiffLabel = document.getElementById('bmi-weight-diff-label');
  const bmiPrime = document.getElementById('bmi-prime');
  const bmiGaugeNeedle = document.getElementById('bmi-gauge-needle');

  const installBtn = document.getElementById('installBtn');

  // --- Sidebar Drawer Elements ---
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');

  // --- State Variables ---
  let timelineUpdateInterval = null;
  let deferredPrompt = null;

  // --- Set Default Dates ---
  // Get today's local date (YYYY-MM-DD) in user's local timezone
  const localToday = new Date();
  const year = localToday.getFullYear();
  const month = String(localToday.getMonth() + 1).padStart(2, '0');
  const day = String(localToday.getDate()).padStart(2, '0');
  const localTodayStr = `${year}-${month}-${day}`;
  
  // Target date ALWAYS defaults to today's local date
  targetDateInput.value = localTodayStr;
  
  // Set default prayer times if not cached
  maghribInput.value = "18:50"; // 6:50 PM
  fajrInput.value = "03:45";    // 3:45 AM

  // --- Load LocalStorage Cached Values ---
  if (localStorage.getItem('toolnext_dob')) {
    birthDateInput.value = localStorage.getItem('toolnext_dob');
  } else {
    // Default DOB to 2000-01-01 if nothing is cached, so the app is immediately active on load
    birthDateInput.value = "2000-01-01";
  }

  // Auto-calculate age on page load using default or cached DOB
  setTimeout(() => {
    calculateAge();
  }, 100);

  if (localStorage.getItem('toolnext_maghrib')) {
    maghribInput.value = localStorage.getItem('toolnext_maghrib');
  }
  if (localStorage.getItem('toolnext_fajr')) {
    fajrInput.value = localStorage.getItem('toolnext_fajr');
    // Auto-calculate if prayer times exist
    setTimeout(() => {
      calculateTahajjut();
    }, 100);
  }

  // --- Tab Navigation Logic ---
  tabAge.addEventListener('click', () => switchTab('age'));
  tabTahajjut.addEventListener('click', () => switchTab('tahajjut'));
  tabBmi.addEventListener('click', () => switchTab('bmi'));

  function switchTab(mode) {
    tabAge.classList.remove('active');
    tabAge.setAttribute('aria-selected', 'false');
    tabTahajjut.classList.remove('active');
    tabTahajjut.setAttribute('aria-selected', 'false');
    tabBmi.classList.remove('active');
    tabBmi.setAttribute('aria-selected', 'false');
    
    panelAge.style.display = 'none';
    panelTahajjut.style.display = 'none';
    panelBmi.style.display = 'none';

    if (mode === 'age') {
      tabAge.classList.add('active');
      tabAge.setAttribute('aria-selected', 'true');
      panelAge.style.display = 'block';
    } else if (mode === 'tahajjut') {
      tabTahajjut.classList.add('active');
      tabTahajjut.setAttribute('aria-selected', 'true');
      panelTahajjut.style.display = 'block';
      if (tahajjutResults.style.display !== 'none') {
        updateTimelineMarker();
      }
    } else if (mode === 'bmi') {
      tabBmi.classList.add('active');
      tabBmi.setAttribute('aria-selected', 'true');
      panelBmi.style.display = 'block';
    }
    // Auto-close sidebar on mobile after choosing a feature
    closeSidebar();
  }

  // --- Sidebar Mobile Drawer Toggles ---
  if (menuToggle) {
    menuToggle.addEventListener('click', openSidebar);
  }
  if (menuClose) {
    menuClose.addEventListener('click', closeSidebar);
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeSidebar);
  }

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('open');
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');
  }

  // --- Helpers for Formatting ---
  function parseTimeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function formatMinutesTo12Hour(minutes) {
    let cleanMinutes = minutes % (24 * 60);
    if (cleanMinutes < 0) cleanMinutes += (24 * 60);
    
    let hours = Math.floor(cleanMinutes / 60);
    const mins = Math.floor(cleanMinutes % 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    if (hours === 0) hours = 12;
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  }

  // --- Age Calculator Section ---
  ageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateAge();
  });

  function calculateAge() {
    const dobStr = birthDateInput.value;
    const targetStr = targetDateInput.value;

    if (!dobStr || !targetStr) return;

    // Cache DOB in local storage (we don't cache target date so it always defaults to today)
    localStorage.setItem('toolnext_dob', dobStr);

    const dob = new Date(dobStr);
    const target = new Date(targetStr);

    // Set times to midnight to calculate date difference purely by dates
    const d1 = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
    const d2 = new Date(target.getFullYear(), target.getMonth(), target.getDate());

    if (d2 < d1) {
      alert("Target date cannot be earlier than your date of birth!");
      return;
    }

    // Age Difference Math matching C++ exactly
    let years = d2.getFullYear() - d1.getFullYear();
    if (d2.getMonth() < d1.getMonth() || (d2.getMonth() === d1.getMonth() && d2.getDate() < d1.getDate())) {
      years--;
    }

    let months = d2.getMonth() - d1.getMonth();
    if (months < 0) {
      months += 12;
    }

    let days = d2.getDate() - d1.getDate();
    if (days < 0) {
      let prevMonthIndex = d2.getMonth() - 1;
      if (prevMonthIndex < 0) prevMonthIndex = 11;
      
      const checkYear = prevMonthIndex === 11 ? d2.getFullYear() - 1 : d2.getFullYear();
      const isLeap = (checkYear % 4 === 0 && (checkYear % 100 !== 0 || checkYear % 400 === 0));
      const daysInMonths = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      days += daysInMonths[prevMonthIndex];
      months--;
      if (months < 0) {
        months += 12;
      }
    }

    // Display primary numbers
    resYears.textContent = years;
    resMonths.textContent = months;
    resDays.textContent = days;

    // Display total metric stats
    const diffMs = d2 - d1;
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Total months calculation
    let totalMonths = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    if (d2.getDate() < d1.getDate()) {
      totalMonths--;
    }

    statMonths.textContent = totalMonths.toLocaleString();
    statDays.textContent = totalDays.toLocaleString();

    // Next Birthday Countdown
    let nextBday = new Date(d2.getFullYear(), d1.getMonth(), d1.getDate());
    if (nextBday < d2) {
      nextBday.setFullYear(d2.getFullYear() + 1);
    }

    const nextBdayDiff = nextBday - d2;
    const nextBdayDays = Math.floor(nextBdayDiff / (1000 * 60 * 60 * 24));
    
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    bdayWeekday.textContent = `Happening on a ${weekdays[nextBday.getDay()]}`;

    if (nextBdayDays === 0) {
      bdayCountdown.textContent = "Today! 🎉";
    } else {
      // Calculate months and days remaining to next birthday
      let remMonths = nextBday.getMonth() - d2.getMonth();
      if (remMonths < 0) remMonths += 12;
      
      let remDays = nextBday.getDate() - d2.getDate();
      if (remDays < 0) {
        let prevM = nextBday.getMonth() - 1;
        if (prevM < 0) prevM = 11;
        const checkY = prevM === 11 ? nextBday.getFullYear() - 1 : nextBday.getFullYear();
        const isL = (checkY % 4 === 0 && (checkY % 100 !== 0 || checkY % 400 === 0));
        const daysInM = [31, isL ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        
        remDays += daysInM[prevM];
        remMonths--;
        if (remMonths < 0) remMonths += 12;
      }
      
      if (remMonths > 0) {
        bdayCountdown.textContent = `${remMonths} month${remMonths > 1 ? 's' : ''} & ${remDays} day${remDays !== 1 ? 's' : ''}`;
      } else {
        bdayCountdown.textContent = `${remDays} day${remDays > 1 ? 's' : ''}`;
      }
    }


    // Show Results
    ageResults.style.display = 'flex';
    // Smooth scroll down to results on mobile
    if (window.innerWidth < 600) {
      ageResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // --- Tahajjut Time Calculator Section ---
  tahajjutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateTahajjut();
  });

  function calculateTahajjut() {
    const maghribStr = maghribInput.value;
    const fajrStr = fajrInput.value;

    if (!maghribStr || !fajrStr) return;

    // Cache values in local storage
    localStorage.setItem('toolnext_maghrib', maghribStr);
    localStorage.setItem('toolnext_fajr', fajrStr);

    let start = parseTimeToMinutes(maghribStr);
    let end = parseTimeToMinutes(fajrStr);

    // If Fajr is on the next day, add 24 hours
    if (end < start) {
      end += 24 * 60;
    }

    const total = end - start;
    const totalHours = Math.floor(total / 60);
    const totalMinutes = total % 60;

    // Compute intervals
    const oneThird = Math.floor(total / 3);
    const twoThirds = Math.floor((total * 2) / 3);

    const firstThirdEnd = (start + oneThird) % (24 * 60);
    const secondThirdEnd = (start + twoThirds) % (24 * 60);
    const tahajjutStart = secondThirdEnd;
    const lastThirdDuration = total - twoThirds;

    // Display outcomes
    resTahajjutStart.textContent = formatMinutesTo12Hour(tahajjutStart);
    resTotalGap.textContent = `${totalHours} hrs ${totalMinutes} mins`;
    resThird1.textContent = formatMinutesTo12Hour(firstThirdEnd);
    resThird2.textContent = formatMinutesTo12Hour(secondThirdEnd);
    resTahajjutDuration.textContent = `${Math.floor(lastThirdDuration / 60)} hrs ${lastThirdDuration % 60} mins`;

    // Timeline Labels
    lblMaghrib.textContent = formatMinutesTo12Hour(start);
    lblThird1.textContent = formatMinutesTo12Hour(firstThirdEnd);
    lblThird2.textContent = formatMinutesTo12Hour(tahajjutStart);
    lblFajr.textContent = formatMinutesTo12Hour(end);

    // Show Results Panel
    tahajjutResults.style.display = 'flex';

    // Start Timeline Sync (glowing dot representation for 'now')
    updateTimelineMarker();
    if (timelineUpdateInterval) clearInterval(timelineUpdateInterval);
    timelineUpdateInterval = setInterval(updateTimelineMarker, 60000); // refresh every minute

    // Smooth scroll down to results on mobile
    if (window.innerWidth < 600) {
      tahajjutResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function updateTimelineMarker() {
    const maghribStr = maghribInput.value;
    const fajrStr = fajrInput.value;

    if (!maghribStr || !fajrStr) return;

    const start = parseTimeToMinutes(maghribStr);
    let end = parseTimeToMinutes(fajrStr);
    if (end < start) {
      end += 24 * 60;
    }

    const total = end - start;
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    let adjustedCurr = currentMin;
    // Align current time if the night crosses midnight
    if (end > 24 * 60) {
      if (currentMin < start) {
        adjustedCurr += 24 * 60;
      }
    }

    if (adjustedCurr >= start && adjustedCurr <= end) {
      const pct = ((adjustedCurr - start) / total) * 100;
      currentMarker.style.left = `${pct}%`;
      currentMarker.style.display = 'flex';
    } else {
      currentMarker.style.display = 'none';
    }
  }

  // --- BMI Calculator Section ---
  const genderMaleLabel = document.getElementById('gender-male-label');
  const genderFemaleLabel = document.getElementById('gender-female-label');
  
  bmiGenderMale.addEventListener('change', () => {
    genderMaleLabel.classList.add('active');
    genderFemaleLabel.classList.remove('active');
  });
  
  bmiGenderFemale.addEventListener('change', () => {
    genderFemaleLabel.classList.add('active');
    genderMaleLabel.classList.remove('active');
  });

  // Load Cached BMI Values
  if (localStorage.getItem('toolnext_bmi_age')) {
    bmiAgeInput.value = localStorage.getItem('toolnext_bmi_age');
  }
  if (localStorage.getItem('toolnext_bmi_gender')) {
    const gender = localStorage.getItem('toolnext_bmi_gender');
    if (gender === 'female') {
      bmiGenderFemale.checked = true;
      genderFemaleLabel.classList.add('active');
      genderMaleLabel.classList.remove('active');
    }
  }
  if (localStorage.getItem('toolnext_bmi_height_ft')) {
    heightFtInput.value = localStorage.getItem('toolnext_bmi_height_ft');
  }
  if (localStorage.getItem('toolnext_bmi_height_in')) {
    heightInInput.value = localStorage.getItem('toolnext_bmi_height_in');
  }
  if (localStorage.getItem('toolnext_bmi_weight')) {
    weightInput.value = localStorage.getItem('toolnext_bmi_weight');
  }

  // Submit Handler
  bmiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateBmi();
  });

  // Clear Handler
  bmiClearBtn.addEventListener('click', () => {
    bmiForm.reset();
    
    // Explicitly reset inputs to standard defaults
    bmiAgeInput.value = "25";
    heightFtInput.value = "5";
    heightInInput.value = "10";
    weightInput.value = "70";
    
    genderMaleLabel.classList.add('active');
    genderFemaleLabel.classList.remove('active');
    bmiResults.style.display = 'none';
    
    localStorage.removeItem('toolnext_bmi_age');
    localStorage.removeItem('toolnext_bmi_gender');
    localStorage.removeItem('toolnext_bmi_height_ft');
    localStorage.removeItem('toolnext_bmi_height_in');
    localStorage.removeItem('toolnext_bmi_weight');
  });

  function calculateBmi() {
    const age = parseInt(bmiAgeInput.value);
    const gender = bmiGenderMale.checked ? 'male' : 'female';
    
    if (isNaN(age) || age < 2 || age > 120) {
      alert("Please enter a valid age between 2 and 120.");
      return;
    }
    
    const ft = parseInt(heightFtInput.value);
    const inch = parseFloat(heightInInput.value) || 0;
    const weight = parseFloat(weightInput.value);
    
    if (isNaN(ft) || ft < 1 || ft > 10 || isNaN(inch) || inch < 0 || inch >= 12) {
      alert("Please enter a valid height in feet and inches (1-10 ft, 0-11 in).");
      return;
    }
    if (isNaN(weight) || weight < 2 || weight > 600) {
      alert("Please enter a valid weight between 2 and 600 kg.");
      return;
    }
    
    const totalInches = ft * 12 + inch;
    const heightM = totalInches * 0.0254;
    const weightKg = weight;
    
    localStorage.setItem('toolnext_bmi_age', age);
    localStorage.setItem('toolnext_bmi_gender', gender);
    localStorage.setItem('toolnext_bmi_height_ft', ft);
    localStorage.setItem('toolnext_bmi_height_in', inch);
    localStorage.setItem('toolnext_bmi_weight', weight);
    
    const bmi = weightKg / (heightM * heightM);
    const prime = bmi / 25;
    
    const minHealthyKg = 18.5 * (heightM * heightM);
    const maxHealthyKg = 24.99 * (heightM * heightM);
    
    const healthyRangeText = `${minHealthyKg.toFixed(1)} kg - ${maxHealthyKg.toFixed(1)} kg`;
    
    let diffText = "";
    let diffLabel = "";
    if (bmi < 18.5) {
      const diffKg = minHealthyKg - weightKg;
      diffText = `Gain ${diffKg.toFixed(1)} kg`;
      diffLabel = "to reach normal range (BMI 18.5)";
    } else if (bmi >= 18.5 && bmi < 25.0) {
      diffText = "0.0 kg (Normal)";
      diffLabel = "you are in the healthy range";
    } else {
      const diffKg = weightKg - maxHealthyKg;
      diffText = `Lose ${diffKg.toFixed(1)} kg`;
      diffLabel = "to reach normal range (BMI 24.9)";
    }
    
    let category = "";
    let badgeClass = "";
    let refRowId = "";
    
    if (bmi < 16.0) {
      category = "Severe Thinness";
      badgeClass = "underweight";
      refRowId = "ref-severe-thinness";
    } else if (bmi >= 16.0 && bmi < 17.0) {
      category = "Moderate Thinness";
      badgeClass = "underweight";
      refRowId = "ref-moderate-thinness";
    } else if (bmi >= 17.0 && bmi < 18.5) {
      category = "Mild Thinness";
      badgeClass = "underweight";
      refRowId = "ref-mild-thinness";
    } else if (bmi >= 18.5 && bmi < 25.0) {
      category = "Normal Weight";
      badgeClass = "normal";
      refRowId = "ref-normal";
    } else if (bmi >= 25.0 && bmi < 30.0) {
      category = "Overweight";
      badgeClass = "overweight";
      refRowId = "ref-overweight";
    } else if (bmi >= 30.0 && bmi < 35.0) {
      category = "Obese Class I (Moderate)";
      badgeClass = "obese";
      refRowId = "ref-obese-1";
    } else if (bmi >= 35.0 && bmi < 40.0) {
      category = "Obese Class II (Severe)";
      badgeClass = "obese";
      refRowId = "ref-obese-2";
    } else {
      category = "Obese Class III (Very Severe)";
      badgeClass = "obese";
      refRowId = "ref-obese-3";
    }
    
    bmiValDisplay.textContent = bmi.toFixed(1);
    bmiCategoryBadge.textContent = category;
    bmiCategoryBadge.className = `bmi-badge ${badgeClass}`;
    
    bmiHealthyRange.textContent = healthyRangeText;
    bmiWeightDiff.textContent = diffText;
    bmiWeightDiffLabel.textContent = diffLabel;
    bmiPrime.textContent = prime.toFixed(2);
    
    document.querySelectorAll('.bmi-ref-table tr').forEach(row => {
      row.classList.remove('active-result-row');
    });
    const activeRow = document.getElementById(refRowId);
    if (activeRow) {
      activeRow.classList.add('active-result-row');
    }
    
    let angle = -90;
    if (bmi <= 15) {
      angle = -90;
    } else if (bmi >= 40) {
      angle = 90;
    } else {
      angle = -90 + ((bmi - 15) / 25) * 180;
    }
    
    bmiGaugeNeedle.style.transform = `rotate(${angle}deg)`;
    bmiResults.style.display = 'flex';
    
    if (window.innerWidth < 600) {
      bmiResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Auto-calculate on initial load if we have cached weight data
  if (localStorage.getItem('toolnext_bmi_weight')) {
    setTimeout(() => {
      calculateBmi();
    }, 100);
  }

  // --- PWA Installation & Service Worker Integration ---
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to show the install button
    installBtn.style.display = 'flex';
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to installation: ${outcome}`);
    // We've used the prompt, and can't use it again, discard it
    deferredPrompt = null;
    // Hide the install button
    installBtn.style.display = 'none';
  });

  window.addEventListener('appinstalled', () => {
    // Clear prompt and hide installation banner
    deferredPrompt = null;
    installBtn.style.display = 'none';
    console.log('ToolNext PWA was installed successfully');
  });

  // --- Theme Changer Logic ---
  const themeButtons = document.querySelectorAll('.theme-btn');
  
  function applyTheme(theme) {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.querySelector('meta[name="theme-color"]').setAttribute('content', isDark ? '#0a0b1e' : '#f8fafc');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'dark' ? '#0a0b1e' : '#f8fafc');
    }
    
    localStorage.setItem('toolnext_theme', theme);
    
    themeButtons.forEach(btn => {
      const isCurrent = btn.getAttribute('data-theme-val') === theme;
      btn.classList.toggle('active', isCurrent);
      btn.setAttribute('aria-checked', isCurrent ? 'true' : 'false');
    });
  }

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const themeVal = btn.getAttribute('data-theme-val');
      applyTheme(themeVal);
    });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = localStorage.getItem('toolnext_theme') || 'system';
    if (currentTheme === 'system') {
      document.querySelector('meta[name="theme-color"]').setAttribute('content', e.matches ? '#0a0b1e' : '#f8fafc');
    }
  });

  const savedTheme = localStorage.getItem('toolnext_theme') || 'system';
  applyTheme(savedTheme);

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered successfully:', reg.scope))
        .catch(err => console.log('Service Worker registration failed:', err));
    });
  }
});

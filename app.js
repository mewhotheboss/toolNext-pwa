document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const tabAge = document.getElementById('tab-age');
  const tabTahajjut = document.getElementById('tab-tahajjut');
  const panelAge = document.getElementById('panel-age');
  const panelTahajjut = document.getElementById('panel-tahajjut');

  const ageForm = document.getElementById('age-form');
  const birthDateInput = document.getElementById('birth-date');
  const targetDateInput = document.getElementById('target-date');
  const ageResults = document.getElementById('age-results');
  const resYears = document.getElementById('result-years');
  const resMonths = document.getElementById('result-months');
  const resDays = document.getElementById('result-days');
  const liveSecondsVal = document.getElementById('live-seconds-value');
  const bdayCountdown = document.getElementById('birthday-countdown');
  const bdayWeekday = document.getElementById('birthday-weekday');
  const statMonths = document.getElementById('stat-total-months');
  const statWeeks = document.getElementById('stat-total-weeks');
  const statDays = document.getElementById('stat-total-days');
  const statHours = document.getElementById('stat-total-hours');
  const statMinutes = document.getElementById('stat-total-minutes');

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

  const installBtn = document.getElementById('installBtn');

  // --- State Variables ---
  let liveTickerInterval = null;
  let timelineUpdateInterval = null;
  let deferredPrompt = null;

  // --- Set Default Dates ---
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  targetDateInput.value = todayStr;
  
  // Set default prayer times if not cached
  maghribInput.value = "18:50"; // 6:50 PM
  fajrInput.value = "03:45";    // 3:45 AM

  // --- Load LocalStorage Cached Values ---
  if (localStorage.getItem('toolnext_dob')) {
    birthDateInput.value = localStorage.getItem('toolnext_dob');
    // Auto-calculate if DOB exists
    setTimeout(() => {
      calculateAge();
    }, 100);
  }
  if (localStorage.getItem('toolnext_target_date')) {
    targetDateInput.value = localStorage.getItem('toolnext_target_date');
  }
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

  function switchTab(mode) {
    if (mode === 'age') {
      tabAge.classList.add('active');
      tabAge.setAttribute('aria-selected', 'true');
      tabTahajjut.classList.remove('active');
      tabTahajjut.setAttribute('aria-selected', 'false');
      panelAge.style.display = 'block';
      panelTahajjut.style.display = 'none';
    } else {
      tabTahajjut.classList.add('active');
      tabTahajjut.setAttribute('aria-selected', 'true');
      tabAge.classList.remove('active');
      tabAge.setAttribute('aria-selected', 'false');
      panelTahajjut.style.display = 'block';
      panelAge.style.display = 'none';
      // Trigger timeline refresh when switching tab to ensure timeline marker is up-to-date
      if (tahajjutResults.style.display !== 'none') {
        updateTimelineMarker();
      }
    }
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

    // Cache values in local storage
    localStorage.setItem('toolnext_dob', dobStr);
    localStorage.setItem('toolnext_target_date', targetStr);

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

    const totalWeeks = Math.floor(totalDays / 7);
    const remDaysInWeeks = totalDays % 7;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    statMonths.textContent = totalMonths.toLocaleString();
    statWeeks.textContent = `${totalWeeks.toLocaleString()}w ${remDaysInWeeks}d`;
    statDays.textContent = totalDays.toLocaleString();
    statHours.textContent = totalHours.toLocaleString();
    statMinutes.textContent = totalMinutes.toLocaleString();

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

    // Setup Live Seconds Ticker (always counting relative to current time)
    if (liveTickerInterval) clearInterval(liveTickerInterval);
    
    // Set birth time to midnight
    const dobWithTime = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate(), 0, 0, 0);
    
    function tick() {
      const now = new Date();
      if (now < dobWithTime) {
        liveSecondsVal.textContent = "0";
        return;
      }
      const secondsLived = Math.floor((now - dobWithTime) / 1000);
      liveSecondsVal.textContent = secondsLived.toLocaleString();
    }
    
    tick();
    liveTickerInterval = setInterval(tick, 1000);

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

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered successfully:', reg.scope))
        .catch(err => console.log('Service Worker registration failed:', err));
    });
  }
});

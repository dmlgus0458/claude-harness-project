#!/usr/bin/env node
/**
 * Pipeline state change notifier
 * Triggered by PostToolUse hook when pipeline-state.json is written.
 * Reads CLAUDE_TOOL_INPUT from env to check if the write target is pipeline-state.json.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const toolInput = process.env.CLAUDE_TOOL_INPUT;
if (!toolInput) process.exit(0);

let input;
try {
  input = JSON.parse(toolInput);
} catch {
  process.exit(0);
}

const filePath = input.file_path || '';
if (!filePath.includes('pipeline-state.json')) process.exit(0);

// Read current state
let state;
try {
  state = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} catch {
  process.exit(0);
}

const steps = state.steps || {};
const changeName = state.change_name || 'unknown';
const classification = state.classification || '?';

const icon = { done: '✅', failed: '❌', running: '🔄', pending: '⬜', skipped: '⏭️' };

// Find the most recently changed step (last non-pending)
const stepOrder = ['gatekeeper', 'spec', 'engineer', 'reviewer', 'e2e-runner'];
let currentStep = null;
let currentStatus = null;
for (const step of stepOrder) {
  if (steps[step] && steps[step] !== 'pending') {
    currentStep = step;
    currentStatus = steps[step];
  }
}

const allDone = stepOrder.every(s => steps[s] === 'done' || steps[s] === 'skipped');
const anyFailed = stepOrder.some(s => steps[s] === 'failed');

let title, message;
if (allDone) {
  title = '✅ Pipeline Complete';
  message = `${changeName} [${classification}] — all steps passed`;
} else if (anyFailed) {
  title = '❌ Pipeline Failed';
  message = `${changeName} — ${currentStep} failed`;
} else if (currentStep) {
  title = `🔄 ${currentStep}`;
  message = `${changeName} [${classification}] — ${currentStatus}`;
} else {
  title = '🚀 Pipeline Started';
  message = `${changeName} [${classification}]`;
}

// Windows toast notification via PowerShell
const ps = `
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Windows.Forms
$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Icon = [System.Drawing.SystemIcons]::Information
$notify.Visible = $true
$notify.BalloonTipTitle = ${JSON.stringify(title)}
$notify.BalloonTipText = ${JSON.stringify(message)}
$notify.BalloonTipIcon = 'Info'
$notify.ShowBalloonTip(4000)
Start-Sleep -Milliseconds 4500
$notify.Dispose()
`.trim();

try {
  execSync(`powershell.exe -NoProfile -WindowStyle Hidden -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
    timeout: 6000,
    stdio: 'ignore',
  });
} catch {
  // Notification failed silently — don't block pipeline
}

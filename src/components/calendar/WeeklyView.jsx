import { useState, useEffect, useMemo, useRef } from 'react';
import { FiZap, FiX, FiDownload } from 'react-icons/fi';
import { toPng } from 'html-to-image';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useShifts } from '../../hooks/useShifts';
import { dateHelpers } from '../../utils/dateHelpers';
import { settingsService } from '../../services/settingsService';
import { employeeService } from '../../services/employeeService';
import { shiftService } from '../../services/shiftService';
import { generateWeeklySchedule } from '../../utils/autoScheduler';
import ShiftCard from '../shifts/ShiftCard';
import Modal from '../common/Modal';
import './WeeklyView.scss';

const WeeklyView = ({ currentDate }) => {
  const { start, end } = dateHelpers.getWeekRange(currentDate);
  const startStr = dateHelpers.formatDateForDB(start);
  const endStr = dateHelpers.formatDateForDB(end);
  const { shifts, loading } = useShifts(startStr, endStr);
  const [settings, setSettings] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [filters, setFilters] = useState({
    position: '',
    name: '',
    timeRange: 'all', // 'all', 'morning', 'afternoon', 'evening'
  });
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    showCancel: false,
  });
  const weekGridRef = useRef(null);

  useEffect(() => {
    const loadSettings = async () => {
      const result = await settingsService.getSettings();
      if (result.success) {
        setSettings(result.data);
      }
    };
    loadSettings();
  }, []);

  const daysInWeek = dateHelpers.getDaysInWeek(currentDate);

  // Filter shifts based on user filters
  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      // Position filter
      if (filters.position && shift.position !== filters.position) {
        return false;
      }

      // Name filter (case insensitive)
      if (
        filters.name &&
        !shift.employeeName.toLowerCase().includes(filters.name.toLowerCase())
      ) {
        return false;
      }

      // Time range filter
      if (filters.timeRange !== 'all') {
        const startHour = parseInt(shift.startTime.split(':')[0]);
        if (
          filters.timeRange === 'morning' &&
          (startHour < 6 || startHour >= 12)
        ) {
          return false;
        }
        if (
          filters.timeRange === 'afternoon' &&
          (startHour < 12 || startHour >= 17)
        ) {
          return false;
        }
        if (
          filters.timeRange === 'evening' &&
          (startHour < 17 || startHour >= 24)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [shifts, filters]);

  const getShiftsForDay = date => {
    const dateStr = dateHelpers.formatDateForDB(date);
    return filteredShifts.filter(shift => shift.date === dateStr);
  };

  // Get unique positions from all shifts
  const uniquePositions = useMemo(() => {
    const positions = new Set(shifts.map(shift => shift.position));
    return Array.from(positions).sort();
  }, [shifts]);

  const clearFilters = () => {
    setFilters({
      position: '',
      name: '',
      timeRange: 'all',
    });
  };

  const hasActiveFilters =
    filters.position || filters.name || filters.timeRange !== 'all';

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleExport = async (format, action = 'download') => {
    setShowExportModal(false);
    setExporting(true);

    try {
      let file;
      const filename = `schedule-week-${dateHelpers.formatDate(start, 'MMM-dd')}-${dateHelpers.formatDate(end, 'MMM-dd-yyyy')}`;

      switch (format) {
        case 'jpeg': {
          const dataUrl = await exportAsJPEG();
          if (action === 'share') {
            await shareFile(dataUrl, filename, 'image/jpeg', '.jpg');
          } else {
            downloadFile(dataUrl, `${filename}.jpg`);
          }
          break;
        }
        case 'xlsx': {
          file = await exportAsXLSX();
          if (action === 'share') {
            await shareFile(
              file,
              filename,
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              '.xlsx'
            );
          } else {
            downloadFile(file, `${filename}.xlsx`);
          }
          break;
        }
        case 'pdf': {
          file = await exportAsPDF();
          if (action === 'share') {
            await shareFile(file, filename, 'application/pdf', '.pdf');
          } else {
            downloadFile(file, `${filename}.pdf`);
          }
          break;
        }
        default:
          break;
      }

      const actionText = action === 'share' ? 'shared' : 'downloaded';
      showModalMessage(
        'success',
        'Success',
        `Schedule ${actionText} successfully!`
      );
    } catch {
      showModalMessage('error', 'Error', 'Failed to export schedule.');
    } finally {
      setExporting(false);
    }
  };

  const downloadFile = (data, filename) => {
    const link = document.createElement('a');
    link.download = filename;

    // Handle both data URLs and blobs
    if (typeof data === 'string') {
      link.href = data;
    } else {
      // eslint-disable-next-line no-undef
      const url = URL.createObjectURL(data);
      link.href = url;
      link.onclick = () => {
        // eslint-disable-next-line no-undef
        setTimeout(() => URL.revokeObjectURL(url), 100);
      };
    }

    link.click();
  };

  const shareFile = async (data, filename, mimeType, extension) => {
    // Check if Web Share API is supported
    // eslint-disable-next-line no-undef
    if (!navigator.share || !navigator.canShare) {
      showModalMessage(
        'warning',
        'Share Not Available',
        'Sharing is not supported on this device. The file will be downloaded instead.'
      );
      downloadFile(data, `${filename}${extension}`);
      return;
    }

    try {
      // Convert data URL or blob to File object
      let blob;
      if (typeof data === 'string' && data.startsWith('data:')) {
        // Data URL (JPEG)
        const response = await fetch(data);
        blob = await response.blob();
      } else {
        // Already a blob or buffer
        blob = data;
      }

      // eslint-disable-next-line no-undef
      const file = new File([blob], `${filename}${extension}`, {
        type: mimeType,
      });

      // Check if the file can be shared
      // eslint-disable-next-line no-undef
      if (!navigator.canShare({ files: [file] })) {
        showModalMessage(
          'warning',
          'Share Not Available',
          'This file type cannot be shared on your device. The file will be downloaded instead.'
        );
        downloadFile(data, `${filename}${extension}`);
        return;
      }

      // Share the file
      // eslint-disable-next-line no-undef
      await navigator.share({
        title: 'Weekly Schedule',
        text: `Schedule for ${dateHelpers.formatDate(start, 'MMM dd')} - ${dateHelpers.formatDate(end, 'MMM dd, yyyy')}`,
        files: [file],
      });
    } catch {
      // User cancelled or sharing failed - just fail silently
      downloadFile(data, `${filename}${extension}`);
    }
  };

  const exportAsJPEG = async () => {
    if (!weekGridRef.current) return;

    // Capture the element without padding first
    const dataUrl = await toPng(weekGridRef.current, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#1a1d29',
      skipFonts: true,
      skipAutoScale: false,
      preferredFontFormat: 'woff2',
      cacheBust: true,
      filter: node => {
        // Skip external resources that might cause CORS issues
        if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
          return false;
        }
        return true;
      },
      style: {
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      },
    });

    // Add padding manually using canvas
    const padding = 60;
    // eslint-disable-next-line no-undef
    const img = new Image();
    img.src = dataUrl;

    return new Promise(resolve => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2;

        // Fill background with same color
        ctx.fillStyle = '#1a1d29';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the image with padding offset
        ctx.drawImage(img, padding, padding);

        resolve(canvas.toDataURL('image/jpeg', 1));
      };
    });
  };

  const exportAsXLSX = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weekly Schedule');

    // Get all unique employees from shifts
    const employeeShifts = new Map();
    filteredShifts.forEach(shift => {
      const key = `${shift.employeeName}-${shift.position}`;
      if (!employeeShifts.has(key)) {
        employeeShifts.set(key, {
          name: shift.employeeName,
          position: shift.position,
          shifts: new Map(),
        });
      }
      const dateStr = shift.date;
      employeeShifts
        .get(key)
        .shifts.set(dateStr, `${shift.startTime}-${shift.endTime}`);
    });

    // Add header row
    const headerRow = ['Employee', 'Position'];
    daysInWeek.forEach(day => {
      headerRow.push(dateHelpers.formatDate(day, 'EEE MM/dd'));
    });
    worksheet.addRow(headerRow);

    // Style header row
    const headerRowObj = worksheet.getRow(1);
    headerRowObj.font = { bold: true };
    headerRowObj.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF34495E' },
    };
    headerRowObj.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    employeeShifts.forEach(emp => {
      const row = [emp.name, emp.position];
      daysInWeek.forEach(day => {
        const dateStr = dateHelpers.formatDateForDB(day);
        row.push(emp.shifts.get(dateStr) || '-');
      });
      worksheet.addRow(row);
    });

    // Set column widths
    worksheet.getColumn(1).width = 20; // Employee
    worksheet.getColumn(2).width = 15; // Position
    for (let i = 3; i <= headerRow.length; i++) {
      worksheet.getColumn(i).width = 12; // Days
    }

    // Generate and return blob
    const buffer = await workbook.xlsx.writeBuffer();
    // eslint-disable-next-line no-undef
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return blob;
  };

  const exportAsPDF = async () => {
    const doc = new jsPDF('landscape');

    doc.setFontSize(16);
    doc.text(
      `Weekly Schedule: ${dateHelpers.formatDate(start, 'MMM dd')} - ${dateHelpers.formatDate(end, 'MMM dd, yyyy')}`,
      14,
      15
    );

    // Prepare table data
    const headers = [
      [
        'Employee',
        'Position',
        ...daysInWeek.map(day => dateHelpers.formatDate(day, 'EEE\nMM/dd')),
      ],
    ];

    const employeeShifts = new Map();
    filteredShifts.forEach(shift => {
      const key = `${shift.employeeName}-${shift.position}`;
      if (!employeeShifts.has(key)) {
        employeeShifts.set(key, {
          name: shift.employeeName,
          position: shift.position,
          shifts: new Map(),
        });
      }
      const dateStr = shift.date;
      employeeShifts
        .get(key)
        .shifts.set(dateStr, `${shift.startTime}-${shift.endTime}`);
    });

    const rows = [];
    employeeShifts.forEach(emp => {
      const row = [emp.name, emp.position];
      daysInWeek.forEach(day => {
        const dateStr = dateHelpers.formatDateForDB(day);
        row.push(emp.shifts.get(dateStr) || '-');
      });
      rows.push(row);
    });

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 25,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Employee
        1: { cellWidth: 25 }, // Position
      },
    });

    // Return blob instead of saving
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
      showCancel: false,
    });
  };

  const showModalMessage = (
    type,
    title,
    message,
    onConfirm = null,
    showCancel = false
  ) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      onCancel: closeModal,
      showCancel,
    });
  };

  const handleGenerateSchedule = async () => {
    if (!settings) {
      showModalMessage(
        'error',
        'Error',
        'Settings not loaded. Please try again.'
      );
      return;
    }

    const message =
      shifts.length > 0
        ? 'This will replace all existing shifts for this week. Are you sure you want to continue?'
        : 'This will generate shifts for the entire week based on employee availability. Continue?';

    showModalMessage(
      'confirm',
      'Generate Weekly Schedule',
      message,
      () => {
        closeModal();
        generateScheduleConfirmed();
      },
      true
    );
  };

  const generateScheduleConfirmed = async () => {
    setGenerating(true);

    try {
      // Delete existing shifts for this week first
      if (shifts.length > 0) {
        await Promise.all(
          shifts.map(shift => shiftService.deleteShift(shift.id))
        );
      }

      const empResult = await employeeService.getEmployees();
      if (!empResult.success) {
        throw new Error('Failed to fetch employees');
      }

      const generatedShifts = generateWeeklySchedule(
        start,
        empResult.data,
        settings
      );

      if (generatedShifts.length === 0) {
        showModalMessage(
          'warning',
          'No Shifts Generated',
          'No shifts could be generated. Check employee availability and requirements.'
        );
        setGenerating(false);
        return;
      }

      const result = await shiftService.batchAddShifts(generatedShifts);

      if (result.success) {
        showModalMessage(
          'success',
          'Success',
          `Successfully generated ${result.count} shifts for the week!`
        );
      } else {
        showModalMessage('error', 'Error', 'Failed to save generated shifts.');
      }
    } catch {
      showModalMessage(
        'error',
        'Error',
        'An error occurred while generating the schedule.'
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="weekly-view-loading">
        <div className="spinner"></div>
        <p>Loading weekly schedule...</p>
      </div>
    );
  }

  return (
    <div className="weekly-view">
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="position-filter">Position</label>
            <select
              id="position-filter"
              value={filters.position}
              onChange={e =>
                setFilters({ ...filters, position: e.target.value })
              }
              className="filter-select"
            >
              <option value="">All Positions</option>
              {uniquePositions.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="name-filter">Employee Name</label>
            <input
              id="name-filter"
              type="text"
              placeholder="Search by name..."
              value={filters.name}
              onChange={e => setFilters({ ...filters, name: e.target.value })}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="time-filter">Time Range</label>
            <select
              id="time-filter"
              value={filters.timeRange}
              onChange={e =>
                setFilters({ ...filters, timeRange: e.target.value })
              }
              className="filter-select"
            >
              <option value="all">All Times</option>
              <option value="morning">Morning (6AM-12PM)</option>
              <option value="afternoon">Afternoon (12PM-5PM)</option>
              <option value="evening">Evening (5PM-12AM)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="clear-filters-button">
              <FiX /> Clear Filters
            </button>
          )}
        </div>

        <div className="action-buttons">
          <button
            onClick={handleGenerateSchedule}
            className="generate-button"
            disabled={generating}
          >
            <FiZap />{' '}
            {generating ? 'Generating...' : 'Generate Weekly Schedule'}
          </button>
          <button
            onClick={handleExportClick}
            className="export-button"
            disabled={exporting || filteredShifts.length === 0}
          >
            <FiDownload /> {exporting ? 'Exporting...' : 'Export Schedule'}
          </button>
        </div>
      </div>

      <div className="week-grid" ref={weekGridRef}>
        {daysInWeek.map(day => {
          const dayShifts = getShiftsForDay(day);
          const isToday = dateHelpers.isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`day-column ${isToday ? 'today' : ''}`}
            >
              <div className="day-header">
                <div className="day-name">
                  {dateHelpers.getDayName(day, true)}
                </div>
                <div className="day-date">
                  {dateHelpers.formatDate(day, 'dd')}
                </div>
                {isToday && <div className="today-label">Today</div>}
              </div>

              <div className="day-shifts">
                {dayShifts.length === 0 ? (
                  <div className="no-shifts">No shifts</div>
                ) : (
                  dayShifts.map(shift => (
                    <ShiftCard key={shift.id} shift={shift} compact />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        showCancel={modal.showCancel}
        confirmText={modal.type === 'confirm' ? 'Continue' : 'OK'}
        cancelText="Cancel"
      />

      {showExportModal && (
        <div
          className="export-modal-overlay"
          onClick={() => setShowExportModal(false)}
        >
          <div className="export-modal" onClick={e => e.stopPropagation()}>
            <h3>Export Weekly Schedule</h3>
            <p>Choose your preferred format and action:</p>
            <div className="export-options">
              <div className="export-format-group">
                <div className="format-header">
                  <FiDownload />
                  <span className="format-name">JPEG Image</span>
                </div>
                <span className="format-desc">
                  Visual snapshot of the schedule
                </span>
                <div className="format-actions">
                  <button
                    className="action-button download"
                    onClick={() => handleExport('jpeg', 'download')}
                  >
                    Download
                  </button>
                  <button
                    className="action-button share"
                    onClick={() => handleExport('jpeg', 'share')}
                  >
                    Share
                  </button>
                </div>
              </div>

              <div className="export-format-group">
                <div className="format-header">
                  <FiDownload />
                  <span className="format-name">Excel (XLSX)</span>
                </div>
                <span className="format-desc">
                  Spreadsheet format for editing
                </span>
                <div className="format-actions">
                  <button
                    className="action-button download"
                    onClick={() => handleExport('xlsx', 'download')}
                  >
                    Download
                  </button>
                  <button
                    className="action-button share"
                    onClick={() => handleExport('xlsx', 'share')}
                  >
                    Share
                  </button>
                </div>
              </div>

              <div className="export-format-group">
                <div className="format-header">
                  <FiDownload />
                  <span className="format-name">PDF Document</span>
                </div>
                <span className="format-desc">Print-ready format</span>
                <div className="format-actions">
                  <button
                    className="action-button download"
                    onClick={() => handleExport('pdf', 'download')}
                  >
                    Download
                  </button>
                  <button
                    className="action-button share"
                    onClick={() => handleExport('pdf', 'share')}
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
            <button
              className="cancel-export-button"
              onClick={() => setShowExportModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyView;

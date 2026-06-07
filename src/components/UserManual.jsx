import {
  Activity,
  ArrowRight,
  BarChart3,
  BadgeInfo,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Download,
  Flag,
  Keyboard,
  ListTree,
  Move,
  Printer,
  Sparkles,
  Users,
  ZoomIn,
  ZoomOut,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { asRoleArray, roleLabel } from '../auth/roles'

const CONTENT = {
  th: {
    langLabel: 'TH',
    langName: 'ภาษาไทย',
    toggleHint: 'Switch to EN',
    heroBadge: 'คู่มือการใช้งานระบบ',
    heroTitle: 'คู่มือการใช้งาน',
    heroSubtitle:
      'อธิบายตั้งแต่การสร้างรายการ การกรอกรายละเอียดข้อมูล ไปจนถึงการใช้ Set Baseline, Baseline, Resources, Month/Week, Critical Path และฟังก์ชันสำคัญของหน้าตารางแผนงาน',
    heroNote: 'คู่มือนี้ใช้งานได้กับทุก Role ในระบบ',
    summaryCards: [
      {
        icon: ListTree,
        title: 'สร้างรายการให้ครบ',
        description: 'เริ่มจาก Add Task แล้วกรอก WBS, ชื่อกิจกรรม, ช่วงเวลา, ความคืบหน้า และ Resource',
      },
      {
        icon: Flag,
        title: 'ตั้ง Baseline',
        description: 'บันทึกแผนปัจจุบันไว้เป็นจุดอ้างอิง แล้วเปิด Baseline เพื่อเทียบกับแผนล่าสุด',
      },
      {
        icon: BarChart3,
        title: 'ตรวจทรัพยากร',
        description: 'ใช้ Resources เพื่อดูภาระงานและหาว่าช่วงใดมีคน/ทีม/ผู้รับเหมาถูกใช้งานมากเกินไป',
      },
    ],
    workflowTitle: 'คู่มือการใช้งานหน้า Schedule',
    workflowSubtitle: 'เริ่มจากงานพื้นฐานก่อน แล้วค่อยใช้เครื่องมือวิเคราะห์และแก้ไขแผนงาน',
    sections: [
      {
        icon: ListTree,
        title: '1) การสร้างรายการและใส่รายละเอียดข้อมูล',
        intro: 'ใช้ปุ่ม Add Task เพื่อเพิ่มงานใหม่ลงใน WBS แล้วกรอกข้อมูลให้ครบก่อนบันทึก',
        bullets: [
          'กดปุ่ม Add Task ที่มุมบนของหน้า Dashboard',
          'ใส่ WBS Code และ Task Name เพื่อจัดกลุ่มและอ้างอิงงาน',
          'เลือก Category ให้ตรงกับลักษณะงาน เช่น Engineering & Procurement, Local Construction, Equipment for Installation หรือ Commissioning',
          'ระบุ Weight (%), Resource และ Task Note เพื่อช่วยวิเคราะห์งาน',
          'กรอก Planning: Plan Start, Plan End และ Plan Progress (%)',
          'กรอก Actual: Actual Start, Actual End และ Actual % Complete',
          'ถ้ากิจกรรมเป็นจุดสำคัญ ให้ติ๊ก Milestone',
        ],
        examples: [
          'ตัวอย่าง: WBS 2.1 · Task Name: Civil Work · Category: Local Construction',
          'ตัวอย่าง: Plan Start = 2026-01-10, Plan End = 2026-02-20, Weight = 12%',
        ],
        noteTitle: 'ตัวอย่างการใช้งาน',
        note: 'หากต้องการดูภาพรวมหลังบันทึก ให้กลับไปที่ Gantt Chart แล้วตรวจสอบแท่งงานและความคืบหน้าทันที',
      },
      {
        icon: Flag,
        title: '2) Set Baseline และ Baseline',
        intro: 'Set Baseline คือการบันทึกแผนปัจจุบันไว้เป็นเส้นอ้างอิง เพื่อใช้เทียบกับแผนที่ปรับในภายหลัง',
        bullets: [
          'จัดแผนงานให้เรียบร้อยก่อน แล้วกดปุ่ม Set Baseline',
          'จะมีหน้าต่างให้ตั้งชื่อ Revision และวันที่บันทึก (ชื่อของคุณจะถูกบันทึกด้วย)',
          'เมื่อต้องการดูแผนอ้างอิง ให้กดปุ่ม Baseline',
          'จะมีหน้าต่างให้เลือกเปิดดู Baseline ของ Revision ใดๆ ที่เคยบันทึกไว้',
          'เส้น/แท่ง baseline สีเทาโปร่งแสงจะปรากฏซ้อนอยู่ใต้งานจริงบน Gantt Chart',
          'ตัวอย่าง: หลังจากแก้ Plan End ของงานหนึ่ง ให้เปิด Baseline เพื่อเทียบว่าช้ากว่าแผนเดิมกี่วัน',
        ],
        examples: [
          'ตัวอย่าง: หลังจากแก้ Plan End ของงานหนึ่ง ให้เปิด Baseline เพื่อเทียบว่าช้ากว่าแผนเดิมกี่วัน',
        ],
        noteTitle: 'ข้อแนะนำ',
        note: 'ถ้าคุณมีแผนเวอร์ชันสำคัญ เช่น แผนอนุมัติครั้งแรกหรือแผนรีบซิงค์หน้างาน ควร Set Baseline ไว้ก่อนทุกครั้ง',
      },
      {
        icon: BarChart3,
        title: '3) Resources',
        intro: 'Resources ใช้สำหรับดูกราฟภาระงานของทรัพยากรในช่วงเวลาต่าง ๆ',
        bullets: [
          'กดปุ่ม Resources เพื่อเปิด/ปิดกราฟทรัพยากร',
          'ดูว่าทีมไหนหรือ resource ไหนถูกใช้งานมากในช่วงเวลาเดียวกัน',
          'ใช้ข้อมูลนี้เพื่อแก้ปัญหาคนล้นงานหรือแบ่งงานใหม่',
        ],
        examples: [
          'ตัวอย่าง: ถ้า Civil Crew มีงานชนกันหลายกิจกรรมในสัปดาห์เดียว ให้ย้ายบางงานไปช่วงถัดไป',
        ],
        noteTitle: 'ประโยชน์',
        note: 'ช่วยให้เห็นคอขวดของการใช้คนและเครื่องมือ ก่อนที่งานจะชนกันในสนาม',
      },
      {
        icon: ZoomIn,
        title: '4) Month / Week / Scale / Zoom',
        intro: 'ปรับมุมมองเวลาให้เหมาะกับงานที่ต้องการอ่านรายละเอียด',
        bullets: [
          'Month ใช้ดูภาพรวมของทั้งโครงการในช่วงเวลายาว',
          'Week ใช้ดูรายละเอียดของกิจกรรมในระดับวัน/สัปดาห์',
          'Zoom In และ Zoom Out ใช้ย่อ-ขยายความหนาแน่นของแถบงาน',
          'ใช้ Scale เพื่อสลับรูปแบบการแสดงผลแบบเดือนหรือสัปดาห์',
        ],
        examples: [
          'ตัวอย่าง: ใช้ Month ในการประชุมผู้บริหาร แล้วสลับเป็น Week ตอนคุยรายละเอียดกับทีมหน้างาน',
        ],
        noteTitle: 'เคล็ดลับ',
        note: 'ถ้าหน้าจอแน่นเกินไป ให้ซูมออกก่อน แล้วค่อยซูมกลับเมื่อจะตรวจงานรายละเอียด',
      },
      {
        icon: Activity,
        title: '5) Critical Path',
        intro: 'Critical Path คือเส้นทางงานที่กระทบวันจบโครงการโดยตรง ถ้างานในเส้นนี้ช้า โครงการจะช้าตาม',
        bullets: [
          'กดปุ่ม Critical Path เพื่อแสดงงานที่อยู่บนเส้นทางวิกฤต',
          'กิจกรรมสำคัญจะถูกเน้นให้เห็นเด่นชัดขึ้น',
          'ใช้ร่วมกับ Baseline เพื่อประเมินผลกระทบจากการเลื่อนงาน',
        ],
        examples: [
          'ตัวอย่าง: ถ้างานติดตั้งหลักอยู่ใน Critical Path แล้วเลื่อน 3 วัน วันจบโครงการก็อาจเลื่อนตาม',
        ],
        noteTitle: 'ข้อสำคัญ',
        note: 'ควรติดตาม Critical Path ทุกครั้งหลังปรับแผนหรือรับแจ้งการหน้างานล่าช้า',
      },
      {
        icon: Move,
        title: '6) Drag, Resize และ Dependency',
        intro: 'คุณสามารถลากแถบงานเพื่อย้ายช่วงเวลา หรือยืดปลายแถบเพื่อปรับระยะเวลาได้',
        bullets: [
          'ลากแถบงานเพื่อย้ายตำแหน่งเวลา',
          'ลากขอบซ้าย/ขวาของแถบเพื่อย่อหรือขยายระยะเวลา',
          'ลากจุดเชื่อมด้านขวาของงานไปยังงานถัดไปเพื่อสร้าง Dependency',
          'ใช้การเชื่อมงานแบบ finish → start เพื่อกำหนดลำดับงาน',
        ],
        examples: [
          'ตัวอย่าง: งาน Concrete ควรเริ่มหลังงาน Formwork เสร็จ ให้สร้าง Dependency ระหว่างสองกิจกรรม',
        ],
        noteTitle: 'ทิป',
        note: 'หลังลากหรือปรับขนาดงาน ให้ตรวจสอบผลกับ Critical Path และ Baseline อีกครั้งเสมอ',
      },
      {
        icon: Keyboard,
        title: '7) Shortcut, Undo และ Redo',
        intro: 'ใช้คีย์ลัดเพื่อลดเวลาการแก้ไขแผน และย้อนกลับหากกดผิด',
        bullets: [
          'Ctrl / Cmd + Z = Undo',
          'Ctrl + Shift + Z หรือ Ctrl + Y = Redo',
          'ปุ่ม Undo / Redo อยู่บน Toolbar ด้านบน',
          'คีย์ลัดจะไม่ทำงานขณะพิมพ์ในช่องกรอกข้อมูล',
        ],
        examples: [
          'ตัวอย่าง: ถ้าลากงานผิดตำแหน่ง ให้กด Undo ทันทีเพื่อล้างการเปลี่ยนแปลงล่าสุด',
        ],
        noteTitle: 'จำง่าย',
        note: 'Undo คือย้อนกลับ Redo คือทำซ้ำสิ่งที่เพิ่งย้อนกลับไป',
      },
    ],
    roleIntroTitle: 'คู่มือแยกตาม Role',
    roleIntro:
      'ส่วนนี้สรุปหน้าที่และวิธีใช้งานสำหรับ Company Management และ User เพื่อให้มองเห็นขอบเขตการทำงานของแต่ละบทบาทได้ชัดเจน',
    roleCards: [
      {
        role: 'CompanyManagement',
        badge: 'โฟกัสที่ทีมของคุณ',
        title: 'Company Management',
        subtitle: 'จัดการผู้ใช้งานและการมอบหมายโปรเจกต์ภายในบริษัท',
        icon: Building2,
        accent: 'from-sky-600 via-blue-600 to-indigo-600',
        accentSoft: 'bg-sky-50 border-sky-200',
        responsibilitiesTitle: 'บทบาทหน้าที่',
        responsibilities: [
          'ดูรายชื่อผู้ใช้งานในบริษัทของคุณ',
          'มอบหมายหรือปรับโปรเจกต์ให้ผู้ใช้งาน',
          'ตรวจสอบสถานะบัญชีผู้ใช้เพื่อความพร้อมในการทำงาน',
          'ช่วยจัดระเบียบทีมให้สอดคล้องกับแต่ละโปรเจกต์',
        ],
        stepsTitle: 'ขั้นตอนการใช้งาน',
        steps: [
          'เลือกเมนู Company User ที่อยู่ใน sidebar ด้านซ้าย',
          'ใช้ช่องค้นหาเพื่อหาชื่อ อีเมล หรือ ตำแหน่งของผู้ใช้งาน',
          'ปรับ Assigned Projects เพื่อเชื่อมผู้ใช้กับโปรเจกต์ที่เกี่ยวข้อง',
          'ดูคอลัมน์ Status เพื่อทราบสถานะของแต่ละบัญชี',
          'กลับไปที่ Project Management เมื่ออยากดูภาพรวมของงาน',
        ],
        tipsTitle: 'เคล็ดลับ',
        tips: 'ใช้หน้านี้เป็นศูนย์กลางของการจัดทีม แล้วสลับไปดู Project Management เพื่อเช็กความคืบหน้าตามโปรเจกต์',
      },
      {
        role: 'User',
        badge: 'ติดตามงานของคุณ',
        title: 'User',
        subtitle: 'ติดตามแผนงานและอ่านความคืบหน้าของโปรเจกต์ที่ได้รับมอบหมาย',
        icon: Users,
        accent: 'from-emerald-600 via-teal-600 to-cyan-600',
        accentSoft: 'bg-emerald-50 border-emerald-200',
        responsibilitiesTitle: 'บทบาทหน้าที่',
        responsibilities: [
          'เปิดดูโปรเจกต์ที่เกี่ยวข้องกับงานของคุณ',
          'อ่านแผนงานในรูปแบบ Gantt Chart และ S-Curve',
          'ใช้ Month / Week และ Zoom เพื่อปรับมุมมอง',
          'ส่งออกข้อมูลเป็น CSV หรือสั่งพิมพ์เมื่อจำเป็น',
        ],
        stepsTitle: 'ขั้นตอนการใช้งาน',
        steps: [
          'เลือกชื่อโปรเจกต์จากเมนู Project Management ทางซ้าย',
          'อ่านภาพรวมแผนงานในหัวข้อ Master Schedule — Gantt & S-Curve',
          'ใช้ปุ่ม Month / Week และ Zoom In / Out เพื่อดูรายละเอียด',
          'เลื่อนดูตาราง WBS เพื่อดูรายการงานและรายละเอียดของแต่ละ Task',
          'ใช้ปุ่ม CSV หรือ Print หากต้องการนำข้อมูลออกไปใช้นอกระบบ',
        ],
        tipsTitle: 'เคล็ดลับ',
        tips: 'ถ้าไม่เห็นบางโปรเจกต์ในรายการ แปลว่าระบบกำลังแสดงเฉพาะโปรเจกต์ที่เกี่ยวข้องกับบัญชีของคุณ',
      },
    ],
    footerTitle: 'เมนูหลักที่คุณจะใช้งานบ่อย',
    footerItems: [
      '<strong>Project Management</strong> ใช้สำหรับเลือกโปรเจกต์และดูภาพรวมงาน',
      '<strong>Company User</strong> ใช้สำหรับดูผู้ใช้งานและจัดการโปรเจกต์ที่เกี่ยวข้องกับบริษัท',
      '<strong>Master Schedule</strong> ใช้สำหรับอ่าน Gantt Chart, S-Curve และรายละเอียดงาน',
    ],
    footerReadTitle: 'วิธีอ่านคู่มือนี้ให้เร็วที่สุด',
    footerReadItems: [
      'ดูหัวข้อที่เกี่ยวกับ role ของคุณก่อน เพื่อทราบหน้าที่หลัก',
      'อ่านขั้นตอนการใช้งานระบบทีละข้อ แล้วลองทำตามใน sidebar และหน้า body',
      'หากต้องการดูข้อมูลเพิ่มเติม ให้ใช้ปุ่มหรือเมนูที่เกี่ยวข้องกับโปรเจกต์ของคุณ',
    ],
  },
  en: {
    langLabel: 'EN',
    langName: 'English',
    toggleHint: 'Switch to TH',
    heroBadge: 'System User Manual',
    heroTitle: 'User Manual',
    heroSubtitle:
      'Covers everything from creating a task and filling in details to Set Baseline, Baseline, Resources, Month/Week, Critical Path, and the key schedule controls.',
    heroNote: 'This guide applies to every role in the system',
    summaryCards: [
      {
        icon: ListTree,
        title: 'Create complete tasks',
        description: 'Start with Add Task, then fill in WBS, task name, dates, progress, and resource data.',
      },
      {
        icon: Flag,
        title: 'Set a Baseline',
        description: 'Save the current plan as a reference and compare it against the latest schedule.',
      },
      {
        icon: BarChart3,
        title: 'Review resources',
        description: 'Use Resources to spot overloaded crews, teams, or vendors across the timeline.',
      },
    ],
    workflowTitle: 'Schedule page guide',
    workflowSubtitle: 'Start with task entry, then move to schedule analysis and control tools.',
    sections: [
      {
        icon: ListTree,
        title: '1) Create a task and fill in the details',
        intro: 'Use Add Task to create a new WBS item, then complete the form before saving.',
        bullets: [
          'Click Add Task on the top toolbar.',
          'Enter the WBS Code and Task Name so the activity is easy to track.',
          'Choose the Category that matches the work type: Engineering & Procurement, Local Construction, Equipment for Installation, or Commissioning.',
          'Fill in Weight (%), Resource, and Task Note to support analysis.',
          'Complete Planning fields: Plan Start, Plan End, and Plan Progress (%).',
          'Complete Actual fields: Actual Start, Actual End, and Actual % Complete.',
          'Mark the task as a Milestone if it represents an important checkpoint.',
        ],
        examples: [
          'Example: WBS 2.1 · Task Name: Civil Work · Category: Local Construction',
          'Example: Plan Start = 2026-01-10, Plan End = 2026-02-20, Weight = 12%',
        ],
        noteTitle: 'Usage example',
        note: 'After saving, return to the Gantt chart to verify the bar position and progress immediately.',
      },
      {
        icon: Flag,
        title: '2) Set Baseline and Baseline',
        intro: 'Set Baseline captures the current plan as a reference so you can compare future updates against it.',
        bullets: [
          'Finish the current plan before clicking Set Baseline.',
          'A modal will appear to set the Revision name and date (your name will be recorded).',
          'Turn on Baseline to select and show the baseline bar/line on the schedule.',
          'A modal will let you choose any previously saved Revision to display.',
          'Use it to compare how far each task has moved from the original plan.',
        ],
        examples: [
          'Example: If you change a task end date later, open Baseline to see how many days it slipped.',
        ],
        noteTitle: 'Recommendation',
        note: 'Set a baseline whenever you lock an approved plan or a major field-synced version.',
      },
      {
        icon: BarChart3,
        title: '3) Resources',
        intro: 'Resources shows a workload histogram for the selected period.',
        bullets: [
          'Click Resources to show or hide the resource chart.',
          'Check which team or resource is overloaded in the same period.',
          'Use the chart to rebalance work before conflicts happen.',
        ],
        examples: [
          'Example: If the Civil Crew has too many tasks in one week, move some activities to the following week.',
        ],
        noteTitle: 'Why it matters',
        note: 'It helps reveal bottlenecks in manpower and equipment before they affect site execution.',
      },
      {
        icon: ZoomIn,
        title: '4) Month / Week / Scale / Zoom',
        intro: 'Adjust the timeline view to match the level of detail you need.',
        bullets: [
          'Month is best for a high-level overview of the full project timeline.',
          'Week is better when you need activity-level detail.',
          'Zoom In / Zoom Out changes how dense the schedule bars appear.',
          'Scale switches the layout between Month and Week views.',
        ],
        examples: [
          'Example: Use Month during an executive meeting, then switch to Week when discussing site tasks with the team.',
        ],
        noteTitle: 'Tip',
        note: 'If the screen feels crowded, zoom out first and zoom back in when you need to inspect details.',
      },
      {
        icon: Activity,
        title: '5) Critical Path',
        intro: 'Critical Path highlights the tasks that directly affect the project finish date.',
        bullets: [
          'Click Critical Path to show the activities on the critical path.',
          'Critical tasks are highlighted more clearly on the chart.',
          'Combine it with Baseline to see how delays affect the target date.',
        ],
        examples: [
          'Example: If a main installation task is critical and slips by 3 days, the project completion date may also slip.',
        ],
        noteTitle: 'Important',
        note: 'Review the critical path whenever you update the plan or receive field delay reports.',
      },
      {
        icon: Move,
        title: '6) Drag, resize, and dependencies',
        intro: 'You can drag schedule bars to move tasks, or resize them to adjust durations.',
        bullets: [
          'Drag a bar to move the task on the timeline.',
          'Drag the left or right edge to shorten or extend the duration.',
          'Drag the connector handle on the right edge to create a dependency.',
          'Use finish → start links to define the execution order.',
        ],
        examples: [
          'Example: A Concrete task should start after Formwork finishes, so create a dependency between them.',
        ],
        noteTitle: 'Best practice',
        note: 'After dragging or resizing, always review the result against Critical Path and Baseline again.',
      },
      {
        icon: Keyboard,
        title: '7) Shortcuts, Undo, and Redo',
        intro: 'Keyboard shortcuts speed up schedule editing and help you recover from mistakes quickly.',
        bullets: [
          'Ctrl / Cmd + Z = Undo',
          'Ctrl + Shift + Z or Ctrl + Y = Redo',
          'Undo / Redo buttons are available on the top toolbar',
          'Shortcuts are disabled while typing in an input field',
        ],
        examples: [
          'Example: If you drag a task to the wrong date, press Undo immediately to revert the last change.',
        ],
        noteTitle: 'Easy to remember',
        note: 'Undo means go back one step; Redo means repeat the last reverted step.',
      },
    ],
    roleIntroTitle: 'Role-specific guide',
    roleIntro:
      'This section summarizes responsibilities and usage flow for Company Management and User so each role can quickly understand its scope.',
    roleCards: [
      {
        role: 'CompanyManagement',
        badge: 'Focus on your team',
        title: 'Company Management',
        subtitle: 'Manage users and project assignments inside your company.',
        icon: Building2,
        accent: 'from-sky-600 via-blue-600 to-indigo-600',
        accentSoft: 'bg-sky-50 border-sky-200',
        responsibilitiesTitle: 'Responsibilities',
        responsibilities: [
          'View the users in your company.',
          'Assign or update the projects each user works on.',
          'Review account status to keep work ready to go.',
          'Organize the team to match each project.',
        ],
        stepsTitle: 'How to use',
        steps: [
          'Open Company User from the left sidebar.',
          'Use search to find a user by name, email, or position.',
          'Update Assigned Projects to connect a user with the right work.',
          'Check Status to understand account readiness.',
          'Go back to Project Management when you need the project overview.',
        ],
        tipsTitle: 'Tip',
        tips: 'Use this page as your team hub, then switch back to Project Management to review project progress.',
      },
      {
        role: 'User',
        badge: 'Track your work',
        title: 'User',
        subtitle: 'Track schedules and read the progress of assigned projects.',
        icon: Users,
        accent: 'from-emerald-600 via-teal-600 to-cyan-600',
        accentSoft: 'bg-emerald-50 border-emerald-200',
        responsibilitiesTitle: 'Responsibilities',
        responsibilities: [
          'Open the projects that relate to your work.',
          'Read the plan in Gantt Chart and S-Curve views.',
          'Use Month / Week and Zoom to change the level of detail.',
          'Export to CSV or print when you need to share information.',
        ],
        stepsTitle: 'How to use',
        steps: [
          'Pick a project from Project Management on the left.',
          'Read the schedule summary in Master Schedule — Gantt & S-Curve.',
          'Use Month / Week and Zoom In / Out to inspect details.',
          'Scroll through WBS to review each task and its timing.',
          'Use CSV or Print when you need to take the data outside the system.',
        ],
        tipsTitle: 'Tip',
        tips: 'If some projects are missing, the system is only showing the projects assigned to your account.',
      },
    ],
    footerTitle: 'Common menus you will use',
    footerItems: [
      '<strong>Project Management</strong> is used to select a project and review its overall plan.',
      '<strong>Company User</strong> is used to manage users and company-related assignments.',
      '<strong>Master Schedule</strong> is used to read the Gantt Chart, S-Curve, and task details.',
    ],
    footerReadTitle: 'How to read this guide fast',
    footerReadItems: [
      'Start with the section that matches your role or the function you need.',
      'Read the steps once, then try the same action in the sidebar and main body.',
      'Use the related buttons in the schedule area whenever you need more detail.',
    ],
  },
}

const SECTION_COLORS = [
  { text: 'text-sky-600', bg: 'bg-sky-100', activeBg: 'bg-sky-600', borderActive: 'border-sky-400', ring: 'ring-sky-50' },
  { text: 'text-emerald-600', bg: 'bg-emerald-100', activeBg: 'bg-emerald-600', borderActive: 'border-emerald-400', ring: 'ring-emerald-50' },
  { text: 'text-rose-600', bg: 'bg-rose-100', activeBg: 'bg-rose-600', borderActive: 'border-rose-400', ring: 'ring-rose-50' },
  { text: 'text-amber-500', bg: 'bg-amber-100', activeBg: 'bg-amber-500', borderActive: 'border-amber-400', ring: 'ring-amber-50' },
  { text: 'text-indigo-600', bg: 'bg-indigo-100', activeBg: 'bg-indigo-600', borderActive: 'border-indigo-400', ring: 'ring-indigo-50' },
  { text: 'text-teal-600', bg: 'bg-teal-100', activeBg: 'bg-teal-600', borderActive: 'border-teal-400', ring: 'ring-teal-50' },
  { text: 'text-purple-600', bg: 'bg-purple-100', activeBg: 'bg-purple-600', borderActive: 'border-purple-400', ring: 'ring-purple-50' },
]

function SummaryCard({ icon: Icon, title, description, colorIdx = 0 }) {
  const theme = SECTION_COLORS[colorIdx % SECTION_COLORS.length]
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex gap-3 items-start">
      <div className={`shrink-0 w-10 h-10 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-slate-800">{title}</div>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function SectionCard({ section, lang, isActive, onClick, index }) {
  const Icon = section.icon
  const theme = SECTION_COLORS[index % SECTION_COLORS.length]
  return (
    <section className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${isActive ? `${theme.borderActive} ring-2 ${theme.ring}` : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
      <button 
        onClick={onClick}
        className="w-full text-left px-5 py-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${isActive ? `${theme.activeBg} text-white shadow-md shadow-slate-200/50` : `${theme.bg} ${theme.text}`}`}>
            <Icon size={22} />
          </div>
          <div className="min-w-0">
            <h2 className={`text-lg font-bold transition-colors ${isActive ? theme.text : 'text-slate-800'}`}>{section.title}</h2>
            {!isActive && <p className="text-sm text-slate-500 truncate mt-0.5">{section.intro}</p>}
          </div>
        </div>
        <div className={`shrink-0 text-slate-400 transition-transform duration-300 ${isActive ? `rotate-180 ${theme.text}` : ''}`}>
          <ChevronDown size={20} />
        </div>
      </button>

      <div className={`grid lg:grid-cols-2 gap-4 px-5 transition-all duration-500 ease-in-out ${isActive ? 'pb-5 opacity-100 max-h-[2000px]' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mt-2 shadow-sm">
          <p className="text-sm text-slate-600 leading-relaxed mb-4 pb-4 border-b border-slate-100">{section.intro}</p>
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold">
            <ArrowRight size={18} className="text-slate-600" />
            {lang === 'th' ? 'ขั้นตอนการใช้งาน' : 'Steps'}
          </div>
          <ol className="space-y-3">
            {section.bullets.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold shrink-0">
                  {index + 1}
                </span>
                <span className="pt-0.5">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 mt-2 space-y-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-800 font-semibold">
              <CheckCircle2 size={18} className="text-emerald-500" />
              {section.noteTitle}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{section.note}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-800 font-semibold">
              <BadgeInfo size={18} className="text-blue-600" />
              {lang === 'th' ? 'ตัวอย่างการใช้งาน' : 'Example'}
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {section.examples.map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <span className="mt-0.5 text-blue-500"><ArrowRight size={15} /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function RoleCard({ guide }) {
  const Icon = guide.icon
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={`bg-gradient-to-r ${guide.accent} px-5 py-5 text-white`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Icon size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <BadgeInfo size={13} /> {guide.badge}
            </div>
            <h2 className="mt-2 text-2xl font-bold">{guide.title}</h2>
            <p className="text-white/85 text-sm leading-relaxed">{guide.subtitle}</p>
          </div>
          <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold whitespace-nowrap">
            Role Guide
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 p-5">
        <div className={`rounded-2xl border ${guide.accentSoft} p-4`}>
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold">
            <ClipboardList size={18} className="text-slate-600" />
            {guide.responsibilitiesTitle}
          </div>
          <ul className="space-y-2">
            {guide.responsibilities.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-600 leading-relaxed">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold">
            <ArrowRight size={18} className="text-slate-600" />
            {guide.stepsTitle}
          </div>
          <ol className="space-y-3">
            {guide.steps.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </span>
                <span className="pt-0.5">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="rounded-2xl bg-slate-900 text-white p-4">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles size={17} className="text-amber-300" />
            {guide.tipsTitle}
          </div>
          <p className="mt-2 text-sm text-slate-200 leading-relaxed">{guide.tips}</p>
        </div>
      </div>
    </section>
  )
}

export default function UserManual({ userProfile }) {
  const [lang, setLang] = useState('th')
  const [activeTab, setActiveTab] = useState('workflow')
  const [activeSection, setActiveSection] = useState(0)
  const copy = CONTENT[lang]
  const roles = asRoleArray(userProfile?.role)
  const roleBadges = roles.length > 0 ? roles : ['CompanyManagement', 'User']

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1280px] mx-auto space-y-4">
        <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white shadow-sm">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.35),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.45),_transparent_30%)]" />
          <div className="relative p-6 lg:p-8 flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-end gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
                <BookOpen size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <Sparkles size={13} className="text-amber-300" />
                  {copy.heroBadge}
                </div>
                <h1 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight">{copy.heroTitle}</h1>
                <p className="mt-2 max-w-3xl text-sm lg:text-base text-white/80 leading-relaxed">{copy.heroSubtitle}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    {copy.heroNote}
                  </span>
                  {roleBadges.map((role) => (
                    <span key={role} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                      {roleLabel(role)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="self-start lg:self-auto flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setLang('th')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    lang === 'th' ? 'bg-white text-slate-900' : 'text-white/75 hover:text-white'
                  }`}
                >
                  TH
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    lang === 'en' ? 'bg-white text-slate-900' : 'text-white/75 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {copy.summaryCards.map((card, idx) => (
                <SummaryCard key={card.title} icon={card.icon} title={card.title} description={card.description} colorIdx={idx} />
              ))}
            </div>
          </div>
        </header>

        <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-full md:w-fit overflow-x-auto scroll-thin">
          <button 
            onClick={() => setActiveTab('workflow')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'workflow' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
          >
            {lang === 'th' ? '1. ขั้นตอนการใช้งาน' : '1. Workflow Guide'}
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'roles' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
          >
            {lang === 'th' ? '2. คู่มือแยกตามสิทธิ์' : '2. Role Guide'}
          </button>
        </div>

        {activeTab === 'workflow' && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 lg:p-6 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Printer size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{copy.workflowTitle}</h2>
                <p className="text-sm text-slate-500">{copy.workflowSubtitle}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {copy.sections.map((section, idx) => (
                <SectionCard 
                  key={section.title} 
                  section={section} 
                  lang={lang} 
                  isActive={activeSection === idx}
                  onClick={() => setActiveSection(activeSection === idx ? -1 : idx)}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === 'roles' && (
          <section className="space-y-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 px-1">
              <Building2 size={18} className="text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">{copy.roleIntroTitle}</h2>
            </div>
            <p className="text-sm text-slate-500 px-1 leading-relaxed">{copy.roleIntro}</p>

            {copy.roleCards.map((guide) => (
              <RoleCard key={guide.role} guide={guide} />
            ))}
          </section>
        )}

        <section className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Download size={18} className="text-blue-600" />
              {copy.footerTitle}
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {copy.footerItems.map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <span className="mt-0.5 text-blue-600"><ArrowRight size={15} /></span>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <ZoomOut size={18} className="text-slate-600" />
              {copy.footerReadTitle}
            </div>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              {copy.footerReadItems.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  )
}

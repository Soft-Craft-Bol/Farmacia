export const initialColumns = {
  todo: {
    id: "todo",
    title: "Por Hacer",
    taskIds: ["1", "2", "3"],
  },
  inProgress: {
    id: "inProgress",
    title: "En Progreso",
    taskIds: ["4"],
  },
  done: {
    id: "done",
    title: "Finalizado",
    taskIds: [],
  },
};

export const tasks = {
  "1": {
    id: "1",
    title: "Campaigns",
    description: "Create a new landing page for campaign",
    status: "todo",
    priority: { color: "orange", priority: "Urgent" },
    image: "https://demos.telerik.com/kendo-ui/content/web/taskboard/taskboard-demo-illustrations-01.png",
  },
  "2": {
    id: "2",
    title: "Newsletters",
    description: "Send newsletter",
    status: "todo",
    priority: { color: "orange", priority: "Urgent" },
    image: "https://demos.telerik.com/kendo-ui/content/web/taskboard/taskboard-demo-illustrations-02.png",
  },
  "3": {
    id: "3",
    title: "Ads Analytics",
    description: "Review ads performance",
    status: "todo",
    priority: { color: "orange", priority: "Urgent" },
    image: "https://demos.telerik.com/kendo-ui/content/web/taskboard/taskboard-demo-illustrations-03.png",
  },
  "4": {
    id: "4",
    title: "SEO Analytics",
    description: "Review SEO results",
    status: "inProgress",
    priority: { color: "orange", priority: "Urgent" },
    image: "https://demos.telerik.com/kendo-ui/content/web/taskboard/taskboard-demo-illustrations-04.png",
  },
};

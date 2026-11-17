import { TrackerState, InterviewTopic, JobStatus } from '@/types/tracker';

export const WEEKS_DATA: [string, string][] = [
  [
    'Linux, SSH, troubleshooting',
    'Setup|Users and permissions|Processes and systemd|Logs, cron, disks|SSH hardening on EC2|Troubleshooting drills',
  ],
  [
    'Networking, Docker, CI (Project 1)',
    'Networking and DNS|HTTP, TLS, nginx|Scripting|Docker hardening|CI to ECR and deploy|Project 1 wrap-up',
  ],
  [
    'AWS core',
    'IAM|VPC by hand|Network security|EC2, ALB, ASG|RDS and S3|Route53, ACM, CloudWatch',
  ],
  [
    'Terraform',
    'Terraform basics|State|Language features|Modules|Project 2 build|Environments',
  ],
  [
    'Terraform CI and SAA prep',
    'GitHub OIDC to AWS|Plan on pull request|Apply on merge|Project 2 wrap-up|SAA study 1|SAA study 2',
  ],
  [
    'Certification and Kubernetes core',
    'SAA revision, kind cluster|Exam day, Deployments|Services, config, secrets|Probes, requests, limits|Debugging|Namespaces and RBAC',
  ],
  [
    'Kubernetes intermediate, start applying',
    'Ingress|Storage and StatefulSets|Autoscaling|Helm|Network policies|Resume and applications',
  ],
  [
    'EKS',
    'EKS with Terraform|AWS Load Balancer Controller|ExternalDNS and cert-manager|Pod IAM|Node scaling|App on EKS',
  ],
  [
    'GitOps (Project 3)',
    'ArgoCD install|Argo applications|Kustomize|CI to GitOps|Hardening the flagship|Project 3 wrap-up',
  ],
  [
    'Observability and reliability',
    'Prometheus stack|PromQL and dashboards|Alerting|App instrumentation|SLOs and logs|Failure drill, postmortem',
  ],
  [
    'Security and cost',
    'Secrets|Pipeline scanning|Policy as code|IAM and audit|Cost control|Merge into Project 3',
  ],
  [
    'Polish and positioning',
    'Case study|Demo video|GitHub cleanup|Resume v2|Interview prep 1|Interview prep 2',
  ],
  [
    'Interview mode',
    'Project walkthrough|Troubleshooting scenarios|CI/CD design|AWS architecture|Terraform and Kubernetes deep dive|Behavioral and offers',
  ],
];

// 91 total days (0..90)
export const DAILY_TOPICS: string[] = (() => {
  const topics: string[] = [];
  WEEKS_DATA.forEach((w, i) => {
    const daysInWeek = w[1].split('|');
    daysInWeek.forEach((topic, j) => {
      topics[i * 7 + j] = topic;
    });
    // Day 7 of week (Sunday)
    topics[i * 7 + 6] = i === 12 ? 'Final review' : 'Review and rest';
  });
  return topics;
})();

export const JOB_STATUSES: JobStatus[] = [
  'Wishlist',
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
  'Ghosted',
];

export const INTERVIEW_TOPICS: InterviewTopic[] = [
  'Linux',
  'Networking',
  'Docker',
  'CI/CD',
  'AWS',
  'Terraform',
  'Kubernetes',
  'Observability',
  'Security',
  'Behavioral',
  'Design',
];

export const PROJECT_CHECKLIST_ITEMS = [
  'README',
  'Architecture Diagram',
  'Teardown steps',
  'Cost notes',
  'Public repo',
  'Demo video',
];

export const DEFAULT_PROJECTS = [
  {
    id: 'p1',
    name: 'Project 1: App on EC2 with nginx, TLS, auto-deploy',
    status: 'Planned' as const,
    repo: '',
    demo: '',
    chk: { README: false, 'Architecture Diagram': false, 'Teardown steps': false, 'Cost notes': false, 'Public repo': false, 'Demo video': false },
    notes: 'Containerized web application deployed to AWS EC2 using Docker, Nginx reverse proxy with automated Let\'s Encrypt SSL/TLS certificates and GitHub Actions CI/CD.',
    links: [],
    imgs: [],
  },
  {
    id: 'p2',
    name: 'Project 2: Terraform 3-tier stack with CI',
    status: 'Planned' as const,
    repo: '',
    demo: '',
    chk: { README: false, 'Architecture Diagram': false, 'Teardown steps': false, 'Cost notes': false, 'Public repo': false, 'Demo video': false },
    notes: 'Modular Terraform infrastructure as code deploying a production 3-tier AWS architecture (VPC, Public/Private subnets, ALB, Auto Scaling EC2 groups, RDS multi-AZ) with automated GitHub Actions plan/apply pipelines.',
    links: [],
    imgs: [],
  },
  {
    id: 'p3',
    name: 'Project 3: EKS and ArgoCD flagship',
    status: 'Planned' as const,
    repo: '',
    demo: '',
    chk: { README: false, 'Architecture Diagram': false, 'Teardown steps': false, 'Cost notes': false, 'Public repo': false, 'Demo video': false },
    notes: 'Production Kubernetes (EKS) flagship project managed with GitOps via ArgoCD, AWS Load Balancer Controller, cert-manager, Prometheus & Grafana observability stack, and Karpenter autoscaling.',
    links: [],
    imgs: [],
  },
];

export function getDefaultState(): TrackerState {
  return {
    start: '2026-11-16',
    theme: 'dark',
    days: {},
    ts: Date.now(),
    col: {
      posts: [],
      projects: DEFAULT_PROJECTS,
      jobs: [],
      qs: [
        {
          id: 'q-sample-1',
          q: 'Explain the difference between Docker CMD and ENTRYPOINT.',
          topic: 'Docker',
          conf: '3',
          a: 'ENTRYPOINT specifies the command that will always be executed when the container starts. CMD provides default arguments for ENTRYPOINT, or acts as the default command if ENTRYPOINT is omitted. CMD can be easily overridden via `docker run <image> <override>`, while ENTRYPOINT requires `--entrypoint`.',
          links: [],
          imgs: [],
        },
        {
          id: 'q-sample-2',
          q: 'How does Kubernetes handle self-healing when a Pod crashes or becomes unhealthy?',
          topic: 'Kubernetes',
          conf: '4',
          a: 'Kubernetes uses Kubelet and Controllers (ReplicaSet/Deployment): Kubelet checks Liveness and Readiness probes. If a Liveness probe fails, Kubelet restarts the container according to its restartPolicy. If a node fails, the Control Plane notices the node lease expiration and reschedules Pods to healthy nodes.',
          links: [],
          imgs: [],
        },
        {
          id: 'q-sample-3',
          q: 'How do you prevent state lock issues and secure secrets in Terraform state?',
          topic: 'Terraform',
          conf: '4',
          a: 'Use an S3 remote backend with DynamoDB state locking (or Terraform Cloud). Enable S3 bucket versioning and SSE-KMS encryption. Restrict IAM permissions to the backend bucket. Avoid hardcoding secrets in tfvars; use AWS Secrets Manager or Vault data sources, or mark sensitive outputs.',
          links: [],
          imgs: [],
        },
      ],
      res: [
        {
          id: 'res-sample-1',
          title: 'Kubernetes Official Documentation & Tasks',
          url: 'https://kubernetes.io/docs/tasks/',
          tag: 'Kubernetes',
          notes: 'Great hands-on drills for pods, services, ingress, and debugging.',
          links: [],
          imgs: [],
        },
        {
          id: 'res-sample-2',
          title: 'AWS Certified Solutions Architect Associate (SAA) Exam Guide',
          url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
          tag: 'AWS',
          notes: 'Official breakdown of domains and question weighting.',
          links: [],
          imgs: [],
        },
      ],
      scores: [],
    },
  };
}

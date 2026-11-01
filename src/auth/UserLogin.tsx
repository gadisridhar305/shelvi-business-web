
import type { WorkerUser } from "../worker/WorkerDashboard";

type UserLoginProps = {
  onLogin: (worker: WorkerUser) => void;
  onBack: () => void;
};

const UserLogin = ({onBack }: UserLoginProps) => {
  return (
    <div>
      <h2>User Login</h2>

      <button onClick={onBack}>
        Back
      </button>
    </div>
  );
};

export default UserLogin;

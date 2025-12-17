from datetime import datetime


class TestLogger:
    def __init__(self, suite_name):
        self.suite_name = suite_name
        self.logs = []
        self.passed = 0
        self.failed = 0
        self.start_time = datetime.now()

    def log(self, test_name, is_success, message, response_json=None):
        status = "PASSED" if is_success else "FAILED"
        print(f"[{test_name}] {status}: {message}") # Keep console output
        
        if is_success: self.passed += 1
        else: self.failed += 1

        self.logs.append({
            "name": test_name,
            "status": status,
            "time": datetime.now().strftime("%H:%M:%S"),
            "msg": message,
            "error": response_json if not is_success else None
        })

    def save_to_file(self):
        timestamp = self.start_time.strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"{self.suite_name}_{timestamp}.txt"
        
        with open(filename, "w") as f:
            f.write(f"TEST: {self.suite_name}\nDATE: {self.start_time}\n")
            f.write(f"PASSED: {self.passed} | FAILED: {self.failed}\n")
            f.write("-" * 50 + "\n\n")
            for log in self.logs:
                f.write(f"[{log['time']}] {log['name']}: {log['status']}\n")
                f.write(f"Message: {log['msg']}\n")
                if log['error']: f.write(f"Error Log: {log['error']}\n")
                f.write("\n")
        print(f"\n[Saved log to {filename}]")
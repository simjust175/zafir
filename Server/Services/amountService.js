import Amount from "../Database/Models/Amount.js";
import General from "../Database/Models/general.js";

class AmountService {
  static async postService(body) {
    return await Amount.postAmount(body);
  }

  static async getEmailsNotConnectedToProjects() {
    return await Amount.getFreeEmails();
  }

  static async getActiveEmailsService() {
    return await Amount.getActiveEmails();
  }

  static async postNewEmailService({ email, password, project_name }) {
    const emailStr = (email || "").trim().toLowerCase();
    if (!emailStr) throw new Error("Email is required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) throw new Error("Invalid email format");

    let projectName = (project_name || "").trim() || `project${Date.now()}`;

    // 1. Check if email exists
    let [emailRow] = await General.getWithFilter("emails", "*", "email = ?", [emailStr]);
    if (!emailRow) {
      if (!password || !password.trim()) throw new Error("Password required for new email");
      emailRow = await General.post("emails", { email: emailStr, password });
    }

    // 2. Check for existing project
    const existingProjects = await General.getWithFilter(
      "projects",
      "*",
      "email = ? AND project_name = ?",
      [emailRow.email_id, projectName]
    );

    if (existingProjects.length > 0) {
      return { email: emailRow, project: existingProjects[0], created: false };
    }

    // 3. Create new project
    const newProject = await General.post("projects", {
      project_name: projectName,
      email: emailRow.email_id,
    });

    return { email: emailRow, project: newProject, created: true };
  }

  static async getService({ token }) {
    if (!token) throw new Error("Token is required");
    
    const result = await Amount.validateByToken(token);
    if (!result || result.length === 0 || !result[0]?.user_id) {
      throw new Error("Invalid user token");
    }
    
    return await Amount.getAmounts();
  }

  static async getPaymentService() {
    const payments = await Amount.getPayments("payments");
    const invoicing = await Amount.getPayments("invoicing");
    return { payments, invoicing };
  }

  static async getProjectIdService(email) {
    if (!email) throw new Error("Email is required");
    
    const emailResult = await General.getWithFilter("emails", "email_id", "email = ?", [email]);
    if (!emailResult || emailResult.length === 0) {
      throw new Error("Email not found");
    }
    
    const { email_id } = emailResult[0];
    const projectResult = await Amount.getProjectId(email_id);
    if (!projectResult || projectResult.length === 0) {
      throw new Error("Project not found for email");
    }
    
    return projectResult[0].project_id;
  }

  static async getActiveProjectIdService(email_id) {
    if (!email_id) throw new Error("Email ID is required");
    
    const projectResult = await Amount.getProjectId(email_id);
    if (!projectResult || projectResult.length === 0) {
      throw new Error("Project not found for email ID");
    }
    
    return projectResult[0].project_id;
  }
}

export default AmountService;
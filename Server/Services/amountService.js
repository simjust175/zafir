import Amount from "../Database/Models/Amount.js";
import General from "../Database/Models/general.js";

class AmountService {
  static async postService(body) {
    console.log("POST BODY💪", body);
    
    try {
      const postAmount = await Amount.postAmount(body);
      if (!postAmount) return null;
      return postAmount;
    } catch (error) {
      throw new Error(`in Services/postService: ${error.message}`);
    }
  }

  static async getEmailsNotConnectedToProjects() {
    try {
      return await Amount.getFreeEmails();
    } catch (error) {
      throw new Error(`in amountServices/getEmailsNotConnectedToProjects: ${error.message}`);
    }
  }

  static async postNewEmailService({ email, password, project_name }) {
    try {
      const emailStr = (email || '').trim().toLowerCase();
      if (!emailStr) throw new Error("Email is required");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailStr)) throw new Error("Invalid email format");

      let finalProjectName = (project_name || '').trim();
      if (!finalProjectName) finalProjectName = `project${Date.now()}`;

      // 1. Check if email exists
      const existingEmails = await General.getWithFilter('emails', '*', `email = "${emailStr}"`);
      let emailRow;

      if (existingEmails && existingEmails.length > 0) {
        emailRow = existingEmails[0];
      } else {
        if (!password || !password.trim()) {
          throw new Error("Password is required to create a new email");
        }

        emailRow = await General.post("emails", { email: emailStr, password });
        if (!emailRow || !emailRow.email_id) {
          throw new Error("Failed to insert new email");
        }
      }

      // 2. Check if project with same name already exists for this email
      const existingProjects = await General.getWithFilter(
        "projects",
        "*",
        `email = ${emailRow.email_id} AND project_name = "${finalProjectName}"`
      );

      if (existingProjects && existingProjects.length > 0) {
        return {
          email: emailRow,
          project: existingProjects[0],
          created: false,
        };
      }

      // 3. Create new project linked to the email
      const newProject = await General.post("projects", {
        project_name: finalProjectName,
        email: emailRow.email_id,
      });

      if (!newProject) throw new Error("Failed to insert new project");

      return {
        email: emailRow,
        project: newProject,
        created: true,
      };
    } catch (error) {
      throw new Error(`in Services/postNewEmailService: ${error.message}`);
    }
  }

  static async getService({ token }) {
    const [{ user_id }] = await Amount.ValidateByToken(token);
    if (!user_id) throw new Error("not the correct user");
    try {
      const getAmounts = await Amount.GetAmounts(user_id); //user_id
      if (!getAmounts) return null;
      return getAmounts;
    } catch (error) {
      throw new Error(`error in amountService/getService: ${error.message}`);
    }
  }

  static async getPaymentService() { //table
    console.log("table to get");
    
    try {
      //const payments = await Amount.getPayments(table)
      const payments = await Amount.getPayments('payments')
      const invoicing = await Amount.getPayments('invoicing')
      if (!payments) return null;
      return { payments, invoicing };
    } catch (error) {
      throw new Error(`error in amountService/getProjectIdService: ${error.message}`);
    }
  }

  static async getProjectIdService(email) {
    try {
      const emailId = await General.getWithFilter(
        "emails",
        "email_id",
        `email = "${email}"`
      );
      
      const [{ project_id }] = await Amount.getProjectId(emailId[0].email_id);
      console.log("project_id", project_id);
      
      if (!project_id) return null;
      return project_id;
    } catch (error) {
      throw new Error(`error in amountService/getProjectIdService: ${error.message}`);
    }
  }
  
  static async getActiveProjectIdService(email_id) {
    try {
      const [{ project_id }] = await Amount.getProjectId(email_id);
      console.log("project_id", project_id);
      
      if (!project_id) return null;
      return project_id;
    } catch (error) {
      throw new Error(`error in amountService/getProjectIdService: ${error.message}`);
    }
  }
}

export default AmountService;

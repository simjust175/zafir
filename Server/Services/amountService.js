import Amount from "../Database/Models/Amount.js";
import General from "../Database/Models/general.js";

class AmountService {
  static async postService(body) {
    try {
      const postAmount = await Amount.postAmount(body);
      if (!postAmount) return null;
      return postAmount;
    } catch (error) {
      throw new Error(`in Services/postService: ${error.message}`);
    }
  }

  static async postNewEmailService({ email, project_name }) {
    try {
      // 1. Check if email already exists
      const emailQuery = `email = "${email.email}"`;
      const existingEmails = await General.getWithFilter('emails', 'email', emailQuery);
  
      if (existingEmails && existingEmails.length > 0) {
        console.log("Email already exists!");
        return { email: existingEmails[0], project: null };
      }
  
      // 2. Post new email
      const newEmail = await General.post("emails", email);
      if (!newEmail) throw new Error("Failed to insert new email");
      
      // 3. Fallback project name if empty or undefined
      let finalProjectName = project_name?.project_name?.trim();
      if (!finalProjectName) {
        const defaultName = `project${Date.now()}`; // or use counter logic
        finalProjectName = defaultName;
      }
  
      // 4. Post new project linked to the email
      const newProject = await General.post("projects", {
        project_name: finalProjectName,
        email: newEmail.email_id
      });
      return { email: newEmail, project: newProject };
    } catch (error) {
      throw new Error(`in Services/postService: ${error.message}`);
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
}

export default AmountService;

export const login = async (req, res) => {
    res.send("You hit the signin endpoint")
}
export const signup = async (req, res) => {
    const { username, email, password } = req.body;
    res.send(`Signup route - Username: ${username}, Email: ${email}`);
}

export const logout = async (req, res) => {
    res.send("You hit the logout endpoint")
}
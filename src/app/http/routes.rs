use super::super::super::errors::Result;

pub const NAME: &'static str = "routes";
pub const ABOUT: &'static str = "List of all of the available routes";

pub fn run() -> Result<()> {
    println!("{:6} {:4} {}", "METHOD", "RANK", "URI");
    Ok(())
}

"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send, Github, Linkedin, Twitter, Mail, MessageSquare, MapPin, Phone,Instagram } from "lucide-react"
import emailjs from "@emailjs/browser"

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // EmailJS configuration
    const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const userID = process.env.NEXT_PUBLIC_EMAILJS_USER_ID;
 // Your EmailJS Public Key (User ID)

    // Get current timestamp in a readable format
    const time = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    })

    // Prepare the template parameters
    const templateParams = {
      name: formState.name,
      email: formState.email,
      subject: formState.subject,
      message: formState.message,
      time: time,
      to_email: "aravsaxena884@gmail.com", // Your Gmail address
    }

    // Send email using EmailJS
    emailjs.send(serviceID!, templateID!, templateParams, userID!).then(
      (response) => {
        console.log("Email sent successfully:", response.status, response.text)
        // Reset form
        setFormState({ name: "", email: "", subject: "", message: "" })
        // Show success message
        alert("Thanks for your message! I'll get back to you soon.")
      },
      (error) => {
        console.error("Failed to send email:", error)
        alert("Failed to send your message. Please try again later.")
      }
    )
  }

  const socialLinks = [
    { name: "GitHub", icon: <Github className="h-5 w-5" />, url: "https://github.com/arav7781", color: "hover:bg-gray-700" },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      url: "https://www.linkedin.com/in/arav-saxena-a081a428a/",
      color: "hover:bg-blue-700",
    },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, url: "https://www.instagram.com/arav_6555/", color: "hover:bg-red-600" },
  ]

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5 text-violet-400" />,
      title: "Email",
      value: "aravsaxena884@gmail.com",
      link: "mailto:aravsaxena884@gmail.com",
    },
    {
      icon: <Phone className="h-5 w-5 text-fuchsia-400" />,
      title: "Phone",
      value: "+919653413126",
      link: "tel:+919653413126",
    },
    {
      icon: <MapPin className="h-5 w-5 text-pink-400" />,
      title: "Location",
      value: "Pune, Maharashtra, India",
      link: "https://maps.google.com/?q=Pune,India",
    },
  ]

  return (
    <section id="contact" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10"></div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get In{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">Touch</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have a project in mind or just want to connect? Feel free to reach out!
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="bg-black/60 backdrop-blur-sm border border-violet-500/20 rounded-xl p-8 h-full">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-violet-400" />
                Send a Message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formState.name}
                      onChange={handleChange}
                      required
                      className="bg-violet-950/20 border-violet-500/30 focus:border-violet-500/70 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formState.email}
                      onChange={handleChange}
                      required
                      className="bg-violet-950/20 border-violet-500/30 focus:border-violet-500/70 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <Input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formState.subject}
                    onChange={handleChange}
                    required
                    className="bg-violet-950/20 border-violet-500/30 focus:border-violet-500/70 transition-all duration-300"
                  />
                </div>

                <div>
                  <Textarea
                    name="message"
                    placeholder="Your Message"
                    value={formState.message}
                    onChange={handleChange}
                    required
                    className="min-h-[180px] bg-violet-950/20 border-violet-500/30 focus:border-violet-500/70 transition-all duration-300"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 group"
                >
                  Send Message
                  <Send className="ml-2 h-4 w-4 transition-all group-hover:translate-x-1" />
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info & 3D Element */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-black/60 backdrop-blur-sm border border-violet-500/20 rounded-xl p-8 h-full flex flex-col">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>

              <div className="space-y-6 mb-8">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="flex items-start"
                  >
                    <div className="p-3 rounded-lg bg-violet-900/30 mr-4">{info.icon}</div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-200">{info.title}</h4>
                      <a
                        href={info.link}
                        className="text-gray-400 hover:text-violet-400 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {info.value}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              <h4 className="text-lg font-semibold mb-4">Connect With Me</h4>

              <div className="flex space-x-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 bg-violet-950/30 border border-violet-500/30 rounded-full text-gray-300 hover:text-white hover:border-violet-500/70 ${link.color} transition-all duration-300`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="p-4 bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 border border-violet-500/30 rounded-lg"
                >
                  <p className="text-gray-300 italic">"Innovation distinguishes between a leader and a follower."</p>
                  <p className="text-right text-gray-400 mt-2">— Steve Jobs</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
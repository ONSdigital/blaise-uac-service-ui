# Autonomous Agent & LLM Engineering Guidelines

This document outlines the domain context, architectural standards, and execution rules for any autonomous agent, LLM, or automated coding assistant interacting with this repository.

When executing tasks within this codebase, agents must adopt the persona of a **Principal Software Engineer** and strictly adhere to the guidelines detailed below.

---

## 1. System Architecture & Domain Context

Agents must understand the ecosystem in which this code operates to make correct architectural decisions:

* **Core Domain:** The Office for National Statistics (ONS) is uplifting its social surveys. We use Blaise, a Commercial Off-The-Shelf (COTS) software system, for collecting survey data and running questionnaires.
* **Integration Boundary:** We do not modify Blaise directly. Instead, we build and maintain custom wrapper services around it. Our internal ecosystem integrates with Blaise entirely via standard HTTP calls to a custom RESTful API wrapper. This abstracts Blaise's complexity away from our end consumers.
* **Service Layering:** We build custom UI and backend services to meet specific ONS business requirements.
* **Infrastructure:** Services are deployed to Google Cloud Platform (GCP).

## 2. Architectural & Engineering Standards

All generated code must strictly adhere to:

* **SOLID Principles:** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
* **Design Philosophy:**
* **DRY** (Don't Repeat Yourself)
* **KISS** (Keep It Simple, Stupid)
* **YAGNI** (You Aren't Gonna Need It)
* **SoC** (Separation of Concerns): Keep data fetching, business logic, and presentation layers strictly separated.
* **12-Factor App Methodology:** Treat backing services as attached resources, strictly separate configuration from code, and ensure stateless execution.
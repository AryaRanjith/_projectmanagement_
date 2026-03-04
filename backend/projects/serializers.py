from rest_framework import serializers
from .models import Project, Task, Milestone, TimeEntry, Document


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    assignee_name = serializers.CharField(source='assignee.username', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'project', 'project_name', 'title', 'description',
            'assignee', 'assignee_name', 'priority', 'status', 'progress',
            'due_date', 'depends_on', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class MilestoneSerializer(serializers.ModelSerializer):
    """Serializer for Milestone model"""
    
    class Meta:
        model = Milestone
        fields = [
            'id', 'project', 'name', 'description', 'due_date',
            'is_completed', 'completed_at', 'created_at'
        ]
        read_only_fields = ['created_at', 'completed_at']


class TimeEntrySerializer(serializers.ModelSerializer):
    """Serializer for TimeEntry model"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = TimeEntry
        fields = [
            'id', 'task', 'task_title', 'user', 'user_name',
            'hours', 'date', 'description', 'created_at'
        ]
        read_only_fields = ['created_at', 'user']


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'project', 'name', 'file', 'uploaded_by',
            'uploaded_by_name', 'uploaded_at'
        ]
        read_only_fields = ['uploaded_at', 'uploaded_by']


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model with computed fields"""
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    task_count = serializers.IntegerField(read_only=True)
    completed_task_count = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'organisation', 'owner', 'owner_name',
            'status', 'start_date', 'end_date', 'budget',
            'task_count', 'completed_task_count', 'progress_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'organisation']


class ProjectDetailSerializer(ProjectSerializer):
    """Extended Project serializer with nested tasks and milestones"""
    tasks = TaskSerializer(many=True, read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['tasks', 'milestones']


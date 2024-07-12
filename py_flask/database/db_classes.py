# -*- coding: utf-8 -*-
"""Database module, including the SQLAlchemy database object and DB-related utilities."""
from py_flask.config.extensions import db
from sqlalchemy import inspect

# Alias common SQLAlchemy names
Column = db.Column
relationship = db.relationship

# custom methods for all models
from sqlalchemy.inspection import inspect

class Edu3Mixin:

    # EXPERIMENTAL, more recursive w/ relationships:
    # with this, we can get values from other sqlAlchemy raw objects,
    # that also have to_dict, if they are 'related' by way of db
    def to_dict(self, include_relationships=False):
        """Convert model instance to a dictionary, optionally including relationships."""
        result = {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
        if include_relationships:
            for key, value in result.items():
                if hasattr(value, 'to_dict'):
                    result[key] = value.to_dict(include_relationships=True)
                elif isinstance(value, list):
                    result[key] = [item.to_dict(include_relationships=True) if hasattr(item, 'to_dict') else item for item in value]
        return result

    @classmethod
    def to_list(cls, query_result):
        """Convert SQLAlchemy query results to a list of dictionaries."""
        if not query_result:
            return []
        if not isinstance(query_result, list):
            query_result = [query_result]  # cast to list if not
        return [item.to_dict() for item in query_result if hasattr(item, 'to_dict')]

class CRUDMixin(object):
    """Mixin that adds convenience methods for CRUD (create, read, update, delete) operations."""

    @classmethod
    def create(cls, **kwargs):
        """Create a new record and save it the database."""
        instance = cls(**kwargs)
        return instance.save()

    def update(self, commit=True, **kwargs):
        """Update specific fields of a record."""
        for attr, value in kwargs.items():
            setattr(self, attr, value)
        return commit and self.save() or self

    def save(self, commit=True):
        """Save the record."""
        db.session.add(self)
        if commit:
            db.session.commit()
        return self

    def delete(self, commit=True):
        """Remove the record from the database."""
        db.session.delete(self)
        return commit and db.session.commit()


class Model(CRUDMixin, db.Model):
    """Base model class that includes CRUD convenience methods."""

    __abstract__ = True

class SurrogatePK(object):
    """A mixin that adds a surrogate integer 'primary key' column named ``id`` to any declarative-mapped class."""

    __table_args__ = {"extend_existing": True}

    id = Column(db.Integer, primary_key=True)

    @classmethod
    def get_by_id(cls, record_id):
        """Get record by ID."""
        if any(
            (
                isinstance(record_id, (str, bytes)) and record_id.isdigit(),
                isinstance(record_id, (int, float)),
            )
        ):
            return cls.query.get(int(record_id))
        return None


def reference_col(
    tablename, nullable=False, pk_name="id", foreign_key_kwargs=None, column_kwargs=None
):
    """Column that adds primary key foreign key reference.

    Usage: ::

        category_id = reference_col('category')
        category = relationship('Category', backref='categories')
    """
    foreign_key_kwargs = foreign_key_kwargs or {}
    column_kwargs = column_kwargs or {}

    return Column(
        db.ForeignKey(f"{tablename}.{pk_name}", **foreign_key_kwargs),
        nullable=nullable,
        **column_kwargs,
    )
